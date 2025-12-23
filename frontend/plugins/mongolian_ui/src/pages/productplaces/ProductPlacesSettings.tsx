// frontend/plugins/mongolian_ui/src/pages/productplaces/ProductPlacesSettings.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { cn } from 'erxes-ui/lib';

const menus = [
  {
    label: 'Stage in products places config',
    key: 'stage',
    path: 'stage',
  },
  {
    label: 'Stage in products splits config',
    key: 'split',
    path: 'split',
  },
  {
    label: 'Stage in products prints config',
    key: 'print',
    path: 'print',
  },
  {
    label: 'Products default filter by Segment',
    key: 'productFilter',
    path: 'product-filter',
  },
];

const ProductPlacesSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('stage');

  // Parse URL to get active tab
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Find the menu item that matches the current path
    const activeMenu = menus.find(menu => menu.path === lastPart);
    if (activeMenu) {
      setActiveTab(activeMenu.key);
    } else if (lastPart === 'product-places') {
      // If we're at the root, default to stage
      setActiveTab('stage');
      navigate('stage', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-full gap-4 p-6">
      {/* LEFT SIDEBAR */}
      <div className="w-72 rounded-lg border bg-white p-4">
        <Button
          variant="outline"
          className="mb-4 w-full justify-start"
          onClick={() => window.history.back()}
        >
          ← Back to Settings
        </Button>

        <div className="space-y-1">
          {menus.map(menu => (
            <button
              key={menu.key}
              onClick={() => {
                setActiveTab(menu.key);
                navigate(menu.path);
              }}
              className={cn(
                'block w-full rounded-md px-3 py-2 text-sm transition text-left',
                activeTab === menu.key
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {menu.label}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Places configs</h2>
        <Outlet /> {/* This will render the nested route component */}
      </div>
    </div>
  );
};

export default ProductPlacesSettings;