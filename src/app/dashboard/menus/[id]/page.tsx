'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Modal } from '@/components/Modal';

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

export default function MenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.id as string;

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    spiceLevel: 0,
    categoryIds: [] as string[],
  });

useEffect(() => {
  fetchMenu();
}, [menuId]);

const [imageFile, setImageFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);

  const fetchMenu = async () => {
    try {
        // cmit5vqh4000cuwoevtgofc9t
        // cmit5vqh4000cuwoevtgofc9t
      const response = await fetch(`/api/menus/${menuId}`, {
        credentials: 'include',
      });

      console.log('Fetch menu response:', response);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/menus/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newCategory,
          menuId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      fetchMenu();
      setShowCategoryModal(false);
      setNewCategory('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = newDish.image || '';
      if (imageFile && previewUrl) {
        setUploading(true);
        const upRes = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: imageFile.name, data: previewUrl }),
        });
        const upBody = await upRes.json();
        if (upRes.ok && upBody.url) {
          imageUrl = upBody.url;
        } else {
          console.error('Upload failed', upBody);
        }
        setUploading(false);
      }

      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newDish,
          price: parseFloat(newDish.price.toString()),
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      fetchMenu();
      setShowDishModal(false);
      setNewDish({
        name: '',
        description: '',
        price: 0,
        image: '',
        spiceLevel: 0,
        categoryIds: [],
      });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error creating dish:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!menu) return <div>Menu not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            {menu.name}
          </h1>
          <p className="text-gray-600">{menu.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Categories & Dishes</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowCategoryModal(true)}>
              Add Category
            </Button>
            <Button variant="secondary" onClick={() => setShowDishModal(true)}>
              Add Dish
            </Button>
          </div>
        </div>

        {menu.categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No categories yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {menu.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {category.dishes.length === 0 ? (
                    <p className="text-gray-600 text-sm">No dishes in this category</p>
                  ) : (
                    <div className="space-y-3">
                      {category.dishes.map((dc) => (
                        <div
                          key={dc.id}
                          className="flex justify-between items-start p-3 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{dc.dish.name}</h4>
                            <p className="text-sm text-gray-600">
                              {dc.dish.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="font-bold text-primary">
                                ₹{dc.dish.price}
                              </span>
                              {dc.dish.spiceLevel! > 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  {'🌶️'.repeat(dc.dish.spiceLevel!)}
                                </span>
                              )}
                            </div>
                          </div>
                          {dc.dish.image && (
                            <img
                              src={dc.dish.image}
                              alt={dc.dish.name}
                              className="w-20 h-20 rounded object-cover ml-4"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        title="Add Category"
        onClose={() => setShowCategoryModal(false)}
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            placeholder="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Dish Modal */}
      <Modal
        isOpen={showDishModal}
        title="Add Dish"
        onClose={() => setShowDishModal(false)}
        size="lg"
      >
        <form onSubmit={handleCreateDish} className="space-y-4">
          <Input
            placeholder="Dish Name"
            value={newDish.name}
            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={newDish.description}
            onChange={(e) =>
              setNewDish({ ...newDish, description: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Price"
            step="0.01"
            value={newDish.price}
            onChange={(e) =>
              setNewDish({ ...newDish, price: parseFloat(e.target.value) })
            }
            required
          />
          <Input
            placeholder="Image URL"
            value={newDish.image}
            onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (!file) {
                  setPreviewUrl(null);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setPreviewUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>
          <Input
            type="number"
            placeholder="Spice Level (0-3)"
            min="0"
            max="3"
            value={newDish.spiceLevel}
            onChange={(e) =>
              setNewDish({ ...newDish, spiceLevel: parseInt(e.target.value) })
            }
          />
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Add to Categories
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {menu.categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newDish.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewDish({
                          ...newDish,
                          categoryIds: [...newDish.categoryIds, category.id],
                        });
                      } else {
                        setNewDish({
                          ...newDish,
                          categoryIds: newDish.categoryIds.filter(
                            (id) => id !== category.id
                          ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="ml-2">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowDishModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
