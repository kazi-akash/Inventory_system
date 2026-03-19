"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search, Clock, Shield, Zap, Package } from "lucide-react";
import { ROUTES } from "@/lib/utils/constants";
import { useState, useEffect } from "react";
import { productsApi } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";
import { getImageUrl, formatCurrency } from "@/lib/utils/formatters";
import type { Product } from "@/lib/types/product";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"new" | "hot">("new");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 13,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getProducts(true, 0, 8);
        setProducts(response.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Category Cards */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Beauty Card */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="/images/landing/oolaboo3.webp"
                alt="Beauty Products"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-2">Beauty</h3>
                <Link href={ROUTES.PRODUCTS}>
                  <span className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 transition-colors">
                    Shop now →
                  </span>
                </Link>
              </div>
            </div>

            {/* Unique Gifts Card */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer bg-yellow-400">
              <img
                src="/images/landing/merelvanvlerken_A_happy_young_man_is_carrying_an_enormous_cardb_36051df2-a370-4457-a120-418b20b09a7a.webp"
                alt="Unique Gifts"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-2">Unique gifts</h3>
                <Link href={ROUTES.PRODUCTS}>
                  <span className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 transition-colors">
                    Shop now →
                  </span>
                </Link>
              </div>
            </div>

            {/* Fashion Card - Right side full height */}
            <div className="relative h-64 lg:row-span-2 lg:h-auto rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br from-blue-400 to-blue-500">
              <img
                src="/images/landing/AdobeStock_979472537.webp"
                alt="Fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-transparent"></div>
              <div className="absolute top-4 left-6">
                <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded">
                  Shop the look
                </span>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-white/90 mb-1">New in</p>
                <h3 className="text-3xl font-bold text-white mb-4">Fashion</h3>
                <Link href={ROUTES.PRODUCTS}>
                  <span className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-full text-sm font-semibold hover:bg-yellow-500 transition-colors shadow-lg">
                    Shop now
                  </span>
                </Link>
              </div>
              <div className="absolute bottom-6 right-6">
                <button className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* New in Earbuds Card */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br from-blue-100 to-blue-50">
              <img
                src="/images/landing/Scherm_afbeelding_2024-10-22_om_13.41.46_1.webp"
                alt="Earbuds"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded">
                  Shop the look
                </span>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-gray-700 mb-1">New in</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Earbuds</h3>
                <Link href={ROUTES.PRODUCTS}>
                  <span className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-yellow-500 transition-colors">
                    Shop now
                  </span>
                </Link>
              </div>
            </div>

            {/* Tech Card */}
            <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br from-gray-100 to-gray-50">
              <img
                src="/images/landing/hero__bsveixlwbms2_xlarge_2x.jpg"
                alt="Technology"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <p className="text-sm text-white/90 mb-1">Latest</p>
                <h3 className="text-2xl font-bold text-white mb-3">Technology</h3>
                <Link href={ROUTES.PRODUCTS}>
                  <span className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
                    Explore
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Search Bar
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full px-6 py-4 pr-12 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div> */}
        </div>
      </section>

       {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Flash Sale now on!</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-4 min-w-[80px]">
                <p className="text-4xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">:</span>
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-4 min-w-[80px]">
                <p className="text-4xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">:</span>
            <div className="text-center">
              <div className="bg-white rounded-lg px-6 py-4 min-w-[80px]">
                <p className="text-4xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-900 font-medium mb-2">Save on modern table office,</p>
            <p className="text-gray-900 font-medium">best sellers + more</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.PRODUCTS}>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-full font-semibold">
                Shop Now
              </Button>
            </Link>
            {/* <Link href={ROUTES.PRODUCTS}>
              <Button className="bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-900 px-8 py-3 rounded-full font-semibold">
                Use Code: FLASH30
              </Button>
            </Link> */}
          </div>
        </div>
      </section>  

      {/* Flash Sale Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Flash Sale Products</h2>
          <Link href={ROUTES.PRODUCTS} className="text-sm text-gray-600 hover:text-gray-900 underline">
            View all products
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => {
              const imageUrl = getImageUrl(product.image_url);
              const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
              const discountedPrice = hasDiscount 
                ? product.price * (1 - product.discount_percentage! / 100)
                : product.price;

              return (
                <Link key={product.id} href={`${ROUTES.PRODUCTS}/${product.id}`} className="group">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {hasDiscount && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          UP TO -{product.discount_percentage}%
                        </span>
                      )}
                      {product.available_inventory < 10 && product.available_inventory > 0 && (
                        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          NEW
                        </span>
                      )}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-32 h-32 text-gray-300 group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">
                            From {formatCurrency(discountedPrice)}
                          </p>
                          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">★</span>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(12)</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                        {product.short_description || product.description || "High quality product available now"}
                      </p>

                      {/* Buy Button */}
                      <button className="w-full py-2 px-4 border border-gray-900 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors">
                        Buy now
                      </button>

                      {/* Availability */}
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {product.available_inventory > 0 ? `${product.available_inventory} available` : 'Out of stock'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

     

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Real-Time Updates
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Inventory updates in real-time. Never miss out on available products.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              5-Minute Reservation
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Reserve items for 5 minutes. Complete checkout before time expires.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Secure Checkout
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Safe and secure transactions. Your data is protected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
