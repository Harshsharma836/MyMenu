'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Menu as MenuIcon, ChevronUp } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  menus: Menu[];
}

interface Menu {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  dishes: DishCategory[];
}

interface DishCategory {
  id: string;
  dish: Dish;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  spiceLevel?: number;
}

export default function DigitalMenuPage() {
  const params = useParams();
  const shareToken = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchMenu();
  }, [shareToken]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/restaurants/public/${shareToken}`);
      if (!response.ok) throw new Error('Menu not found');
      const data = await response.json();
      setRestaurant(data);

      // Collect all unique categories from all menus
      const categoriesSet = new Map<string, Category>();
      data.menus.forEach((menu: Menu) => {
        menu.categories.forEach((cat: Category) => {
          if (!categoriesSet.has(cat.id)) {
            categoriesSet.set(cat.id, cat);
          }
        });
      });
      setAllCategories(Array.from(categoriesSet.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const currentCategory = allCategories[currentCategoryIndex];
  const categoryDishes = currentCategory?.dishes || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-gray-800 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-300 text-sm">{restaurant.location}</p>
        </div>
      </div>

      {/* Current Category Tab (Fixed) */}
      {currentCategory && (
        <div className="sticky top-[100px] z-30 bg-white border-b-2 border-primary shadow-md">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">{currentCategory.name}</h2>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <MenuIcon size={24} className="text-primary" />
            </button>
          </div>
        </div>
      )}

      {/* Category Menu (Floating) */}
      {showCategoryMenu && (
        <div className="fixed top-[180px] right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-xs">
          <div className="p-4">
            <h3 className="font-bold text-secondary mb-3 text-center">Categories</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allCategories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setCurrentCategoryIndex(index);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded transition ${
                    index === currentCategoryIndex
                      ? 'bg-primary text-white font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {categoryDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No dishes in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categoryDishes.map((dishCategory) => {
              const dish = dishCategory.dish;
              return (
                <div
                  key={dishCategory.id}
                  className="flex gap-4 pb-6 border-b border-gray-200 hover:bg-gray-50 p-3 rounded transition"
                >
                  {/* Dish Image */}
                  {dish.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-24 h-24 rounded-lg object-cover shadow-md"
                      />
                    </div>
                  )}

                  {/* Dish Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-secondary text-lg">
                          {dish.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {dish.description}
                        </p>
                      </div>
                      <span className="text-primary font-bold text-lg flex-shrink-0">
                        ₹{dish.price}
                      </span>
                    </div>

                    {/* Spice Level & Ratings */}
                    <div className="flex items-center gap-4 mt-3">
                      {dish.spiceLevel && dish.spiceLevel > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-orange-600">
                            Spice:
                          </span>
                          <span className="text-lg">
                            {'🌶️'.repeat(Math.min(dish.spiceLevel, 3))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Category Navigation */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        {allCategories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setCurrentCategoryIndex(index)}
            className={`w-12 h-12 rounded-full shadow-lg font-bold text-sm transition transform hover:scale-110 ${
              index === currentCategoryIndex
                ? 'bg-primary text-white'
                : 'bg-white text-secondary border-2 border-primary hover:bg-primary hover:text-white'
            }`}
            title={category.name}
          >
            {index + 1}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
