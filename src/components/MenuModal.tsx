import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';

interface DishItem {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  dishes: { dish: DishItem }[];
}

interface MenuData {
  id: string;
  name: string;
  categories: Category[];
}

interface Props {
  restaurantId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuModal: React.FC<Props> = ({ restaurantId, isOpen, onClose }) => {
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !restaurantId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!mounted) return;
        // data.menus includes categories -> dishes
        setMenus(data.menus || []);
      } catch (err) {
        console.error('Failed to load menus for modal', err);
      return (
        <Modal isOpen={isOpen} onClose={onClose} title={""} size="md">
          <div className="max-h-[86vh] overflow-y-auto px-4 py-6">
            {loading ? (
              <div className="py-12 text-center text-gray-600">Loading...</div>
            ) : (
              <div className="space-y-8">
                {menus.length === 0 && (
                  <div className="py-8 text-center text-gray-600">No menus available</div>
                )}

                {menus.map((menu) => (
                  <div key={menu.id} className="">
                    <div className="text-center text-pink-500 font-semibold mb-6 text-sm tracking-wide">{menu.name}</div>
                    <div className="space-y-4">
                      {menu.categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between px-2">
                          <div className="text-gray-800 text-sm">{cat.name}</div>
                          <div className="text-gray-500 text-sm">{(cat.dishes || []).length}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      );
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MenuModal;
