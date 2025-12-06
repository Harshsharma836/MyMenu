'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Modal } from '@/components/Modal';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  menus: Menu[];
  accessLinks: AccessLink[];
}

interface Menu {
  id: string;
  name: string;
  description?: string;
}

interface AccessLink {
  id: string;
  shareToken: string;
}

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newMenu, setNewMenu] = useState({ name: '', description: '' });
  const [qrValue, setQrValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRestaurant(data);
      // if restaurant has an image field, use it
      // (we're not persisting images to DB in this change; this will prefer imageUrl if present on data)
      if ((data as any).imageUrl) setImageUrl((data as any).imageUrl);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newMenu,
          restaurantId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      fetchRestaurant();
      setShowMenuModal(false);
      setNewMenu({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating menu:', error);
    }
  };

  const handleShowQR = () => {
    if (restaurant?.accessLinks[0]) {
      const shareUrl = `${window.location.origin}/menu/${restaurant.accessLinks[0].shareToken}`;
      setQrValue(shareUrl);
      setShowQRModal(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageFile || !previewUrl) return;
    setUploading(true);
    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: imageFile.name, data: previewUrl }),
      });
      const body = await response.json();
      if (response.ok && body.url) {
        setImageUrl(body.url);
        setImageFile(null);
        setPreviewUrl(null);
        // optionally refetch restaurant to pick up DB-saved image later
        fetchRestaurant();
      } else {
        console.error('Upload failed', body);
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-0"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-4 w-full">
            <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="restaurant" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-secondary mb-1">{restaurant.name}</h1>
              <p className="text-gray-600">{restaurant.location}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={!previewUrl || uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button variant="outline" onClick={() => { setImageFile(null); setPreviewUrl(null); }}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Menus</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowMenuModal(true)}>
              Create Menu
            </Button>
            <Button variant="secondary" onClick={handleShowQR}>
              Show QR Code
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurant.menus.map((menu) => (
            <Card
              key={menu.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(`/dashboard/menus/${menu.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{menu.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-300 border-2 border-white shadow-sm" title="veg/veg-indicator" />
                      <div className="text-lg font-semibold">₹ { (menu as any).price ?? '--' }</div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {menu.description || 'No description available.'}
                    </p>
                    <div className="mt-2">
                      <button
                        className="text-primary text-sm font-medium"
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/menus/${menu.id}`); }}
                      >
                        View items
                      </button>
                    </div>
                  </div>

                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {/* placeholder thumb; if menu.imageUrl exists show it */}
                    {(menu as any).imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(menu as any).imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating center Menu button (mobile style from screenshots) */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <Button className="bg-primary text-white px-6 py-2 rounded-full shadow-lg">
              ☰ Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Create Menu Modal */}
      <Modal
        isOpen={showMenuModal}
        title="Create Menu"
        onClose={() => setShowMenuModal(false)}
      >
        <form onSubmit={handleCreateMenu} className="space-y-4">
          <Input
            placeholder="Menu Name"
            value={newMenu.name}
            onChange={(e) =>
              setNewMenu({ ...newMenu, name: e.target.value })
            }
            required
          />
          <Input
            placeholder="Description"
            value={newMenu.description}
            onChange={(e) =>
              setNewMenu({ ...newMenu, description: e.target.value })
            }
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowMenuModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        title="Menu QR Code"
        onClose={() => setShowQRModal(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded border-2 border-primary">
            <p className="text-center font-bold text-primary text-2xl mb-2">QR</p>
            <p className="text-center text-xs text-gray-600">Placeholder for QR Code</p>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Customers can scan this QR code to view your menu
          </p>
          <input
            type="text"
            value={qrValue}
            readOnly
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(qrValue);
              alert('Link copied!');
            }}
          >
            Copy Link
          </Button>
        </div>
      </Modal>
    </div>
  );
}
