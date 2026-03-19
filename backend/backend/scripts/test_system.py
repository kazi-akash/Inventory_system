"""System integration test script"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx


BASE_URL = "http://localhost:8000/api/v1"


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def print_success(message):
    print(f"{Colors.GREEN}✓{Colors.END} {message}")


def print_error(message):
    print(f"{Colors.RED}✗{Colors.END} {message}")


def print_info(message):
    print(f"{Colors.BLUE}ℹ{Colors.END} {message}")


def print_warning(message):
    print(f"{Colors.YELLOW}⚠{Colors.END} {message}")


async def test_authentication():
    """Test authentication flow"""
    print(f"\n{Colors.BLUE}=== Testing Authentication ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        # Test login
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "user@example.com", "password": "user123"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data["access_token"]
            print_success("Login successful")
            
            # Test get current user
            response = await client.get(
                f"{BASE_URL}/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                user = response.json()
                print_success(f"Got current user: {user['email']}")
                return token
            else:
                print_error("Failed to get current user")
                return None
        else:
            print_error(f"Login failed: {response.text}")
            return None


async def test_products(token):
    """Test product endpoints"""
    print(f"\n{Colors.BLUE}=== Testing Products ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # List products
        response = await client.get(f"{BASE_URL}/products", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            products = data["products"]
            print_success(f"Listed {len(products)} products")
            
            if products:
                product = products[0]
                product_id = product["id"]
                print_info(f"Product: {product['name']} - ${product['price']}")
                print_info(f"Available: {product['available_inventory']}/{product['total_inventory']}")
                
                # Get product details
                response = await client.get(
                    f"{BASE_URL}/products/{product_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    print_success("Got product details")
                    return product_id, product['available_inventory']
                else:
                    print_error("Failed to get product details")
            else:
                print_warning("No products found. Run seed_data.py first!")
        else:
            print_error(f"Failed to list products: {response.text}")
    
    return None, 0


async def test_reservation(token, product_id, initial_inventory):
    """Test reservation flow"""
    print(f"\n{Colors.BLUE}=== Testing Reservation ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create reservation
        quantity = 2
        response = await client.post(
            f"{BASE_URL}/reservations",
            headers=headers,
            json={"product_id": product_id, "quantity": quantity}
        )
        
        if response.status_code == 201:
            reservation = response.json()
            reservation_id = reservation["id"]
            print_success(f"Created reservation: {reservation_id}")
            print_info(f"Quantity: {quantity}")
            print_info(f"Expires at: {reservation['expires_at']}")
            
            # Verify inventory decreased
            response = await client.get(
                f"{BASE_URL}/products/{product_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                product = response.json()
                new_inventory = product['available_inventory']
                expected = initial_inventory - quantity
                
                if new_inventory == expected:
                    print_success(f"Inventory correctly decreased: {initial_inventory} → {new_inventory}")
                else:
                    print_error(f"Inventory mismatch! Expected {expected}, got {new_inventory}")
            
            # List reservations
            response = await client.get(
                f"{BASE_URL}/reservations",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success(f"Listed {len(data['reservations'])} reservations")
            
            return reservation_id, quantity
        else:
            print_error(f"Failed to create reservation: {response.text}")
            return None, 0


async def test_checkout(token, reservation_id, product_id, quantity, initial_inventory):
    """Test checkout flow"""
    print(f"\n{Colors.BLUE}=== Testing Checkout ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete checkout
        response = await client.post(
            f"{BASE_URL}/checkout/{reservation_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            checkout = response.json()
            print_success(f"Checkout completed: {checkout['status']}")
            print_info(f"Completed at: {checkout['completed_at']}")
            
            # Verify reservation status
            response = await client.get(
                f"{BASE_URL}/reservations/{reservation_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                reservation = response.json()
                if reservation['status'] == 'completed':
                    print_success("Reservation status: completed")
                else:
                    print_error(f"Unexpected status: {reservation['status']}")
            
            # Verify inventory remains decreased
            response = await client.get(
                f"{BASE_URL}/products/{product_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                product = response.json()
                expected = initial_inventory - quantity
                if product['available_inventory'] == expected:
                    print_success(f"Inventory correctly finalized: {expected}")
                else:
                    print_error(f"Inventory mismatch after checkout!")
            
            return True
        else:
            print_error(f"Checkout failed: {response.text}")
            return False


async def test_race_condition(token, product_id):
    """Test concurrent reservations"""
    print(f"\n{Colors.BLUE}=== Testing Race Condition Prevention ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current inventory
        response = await client.get(
            f"{BASE_URL}/products/{product_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            print_error("Failed to get product")
            return
        
        initial_inventory = response.json()['available_inventory']
        print_info(f"Initial inventory: {initial_inventory}")
        
        # Create 10 concurrent reservations
        quantity_per_request = 5
        num_requests = 10
        total_requested = quantity_per_request * num_requests
        
        print_info(f"Simulating {num_requests} concurrent requests of {quantity_per_request} items each")
        print_info(f"Total requested: {total_requested}, Available: {initial_inventory}")
        
        tasks = []
        for i in range(num_requests):
            task = client.post(
                f"{BASE_URL}/reservations",
                headers=headers,
                json={"product_id": product_id, "quantity": quantity_per_request}
            )
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Count successes and failures
        successes = sum(1 for r in responses if not isinstance(r, Exception) and r.status_code == 201)
        failures = num_requests - successes
        
        print_info(f"Successful: {successes}, Failed: {failures}")
        
        # Verify final inventory
        response = await client.get(
            f"{BASE_URL}/products/{product_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            final_inventory = response.json()['available_inventory']
            expected_reserved = successes * quantity_per_request
            expected_final = initial_inventory - expected_reserved
            
            print_info(f"Final inventory: {final_inventory}")
            print_info(f"Expected: {expected_final}")
            
            if final_inventory == expected_final:
                print_success("✓ No overselling! Race condition prevented correctly")
            else:
                print_error(f"✗ Inventory mismatch! Possible overselling detected")
            
            if final_inventory >= 0:
                print_success("✓ Inventory never went negative")
            else:
                print_error("✗ Inventory went negative!")


async def test_admin_endpoints():
    """Test admin-only endpoints"""
    print(f"\n{Colors.BLUE}=== Testing Admin Endpoints ==={Colors.END}")
    
    async with httpx.AsyncClient() as client:
        # Login as admin
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@example.com", "password": "admin123"}
        )
        
        if response.status_code != 200:
            print_error("Admin login failed")
            return
        
        admin_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create product
        response = await client.post(
            f"{BASE_URL}/products",
            headers=headers,
            json={
                "name": "Test Product",
                "price": 99.99,
                "total_inventory": 10,
                "available_inventory": 10
            }
        )
        
        if response.status_code == 201:
            product = response.json()
            product_id = product["id"]
            print_success(f"Admin created product: {product['name']}")
            
            # Update product
            response = await client.put(
                f"{BASE_URL}/products/{product_id}",
                headers=headers,
                json={"price": 89.99}
            )
            
            if response.status_code == 200:
                print_success("Admin updated product")
            
            # Delete product
            response = await client.delete(
                f"{BASE_URL}/products/{product_id}",
                headers=headers
            )
            
            if response.status_code == 204:
                print_success("Admin deleted product")
        else:
            print_error(f"Failed to create product: {response.text}")


async def main():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}  Inventory Reservation System - Integration Tests{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    
    try:
        # Test authentication
        token = await test_authentication()
        if not token:
            print_error("\nAuthentication failed. Cannot continue.")
            return
        
        # Test products
        product_id, initial_inventory = await test_products(token)
        if not product_id:
            print_error("\nNo products available. Run seed_data.py first!")
            return
        
        # Test reservation
        reservation_id, quantity = await test_reservation(token, product_id, initial_inventory)
        if not reservation_id:
            print_error("\nReservation failed. Cannot continue.")
            return
        
        # Test checkout
        await test_checkout(token, reservation_id, product_id, quantity, initial_inventory)
        
        # Test race conditions
        await test_race_condition(token, product_id)
        
        # Test admin endpoints
        await test_admin_endpoints()
        
        print(f"\n{Colors.GREEN}{'='*50}{Colors.END}")
        print(f"{Colors.GREEN}  All tests completed!{Colors.END}")
        print(f"{Colors.GREEN}{'='*50}{Colors.END}\n")
        
    except Exception as e:
        print_error(f"\nTest failed with error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
