import { ProductList } from '@/components/products/ProductList';

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">
          Browse our available products. Inventory updates in real-time.
        </p>
      </div>
      <ProductList />
    </div>
  );
}
