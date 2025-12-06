'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Modal } from '@/components/Modal';
import MenuModal from '@/components/MenuModal';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  menus: Menu[];
}

interface Menu {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '' });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newRestaurant),
      });

      if (!response.ok) throw new Error('Failed to create');
      const data = await response.json();
      setRestaurants([...restaurants, data]);
      setShowModal(false);
      setNewRestaurant({ name: '', location: '' });
    } catch (error) {
      console.error('Error creating restaurant:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-secondary">MyMenu Dashboard</h1>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">My Restaurants</h2>
          <Button onClick={() => setShowModal(true)}>
            Create Restaurant
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/dashboard/restaurants/${restaurant.id}`)}
              >
                <CardHeader>
                  <CardTitle>{restaurant.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {restaurant?.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Menus:</strong> {restaurant?.menus?.length}
                  </p>
                  <div className="mt-2">
                    <button
                      className="text-primary text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRestaurantId(restaurant.id);
                        setShowMenuModal(true);
                      }}
                    >
                      View Menu
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Restaurant Modal */}
      <Modal
        isOpen={showModal}
        title="Create Restaurant"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <Input
            placeholder="Restaurant Name"
            value={newRestaurant.name}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, name: e.target.value })
            }
            required
          />
          <Input
            placeholder="Location"
            value={newRestaurant.location}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, location: e.target.value })
            }
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
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      <MenuModal
        isOpen={showMenuModal}
        restaurantId={selectedRestaurantId}
        onClose={() => setShowMenuModal(false)}
      />
    </div>
  );
}
