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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
        const loadedMenus = data.menus || [];
        setMenus(loadedMenus);
        // expand all menus and categories by default so inner items are visible
        const menusOpen: Record<string, boolean> = {};
        const catsOpen: Record<string, boolean> = {};
        loadedMenus.forEach((m: any) => {
          menusOpen[m.id] = true;
          (m.categories || []).forEach((c: any) => { catsOpen[c.id] = true; });
        });
        setExpandedMenus(menusOpen);
        setExpandedCategories(catsOpen);
      } catch (err) {
        console.error('Failed to load menus for modal', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isOpen, restaurantId]);

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

            {menus.map((menu) => {
              const isMenuOpen = !!expandedMenus[menu.id];
              return (
                <div key={menu.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedMenus((s) => ({ ...s, [menu.id]: !s[menu.id] }))}
                    className="w-full text-center text-pink-500 font-semibold mb-4 text-sm tracking-wide"
                  >
                    {menu.name}
                  </button>

                  {isMenuOpen && (
                    <div className="space-y-4 px-2">
                      {menu.categories.map((cat) => {
                        const isCatOpen = !!expandedCategories[cat.id];
                        return (
                          <div key={cat.id} className="border-b pb-2">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setExpandedCategories((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                                className="text-gray-800 text-sm text-left"
                              >
                                {cat.name}
                              </button>
                              <div className="text-gray-500 text-sm">{(cat.dishes || []).length}</div>
                            </div>

                            {isCatOpen && (
                              <div className="mt-2 space-y-2 pl-2">
                                {(cat.dishes || []).map((dc) => {
                                  const dish = (dc as any).dish || dc;
                                  return (
                                    <div key={dish.id} className="flex items-start justify-between">
                                      <div className="text-sm text-gray-800">{dish.name}</div>
                                      <div className="text-sm text-gray-500">{dish.price !== undefined ? `₹ ${dish.price}` : ''}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MenuModal;
