import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib';

// Import all the page components
import StagePage from './StagePage';
import SplitPage from './SplitPage';
import PrintPage from './PrintPage';
import ProductFilterPage from './ProductFilterPage';

const menus = [
  {
    label: 'Stage in products places config',
    key: 'stage',
    component: StagePage,
  },
  {
    label: 'Stage in products splits config',
    key: 'split',
    component: SplitPage,
  },
  {
    label: 'Stage in products prints config',
    key: 'print',
    component: PrintPage,
  },
  {
    label: 'Products default filter by Segment',
    key: 'productFilter',
    component: ProductFilterPage,
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
    
    if (menus.some(menu => menu.key === lastPart)) {
      setActiveTab(lastPart);
    } else {
      // Default to first tab
      setActiveTab('stage');
      navigate('/mongolian/product-places/stage', { replace: true });
    }
  }, [location.pathname, navigate]);

  const ActiveComponent = menus.find(menu => menu.key === activeTab)?.component || StagePage;

  return (
    <div className="flex h-full gap-4">
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
                navigate(menu.key);
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
        <ActiveComponent />
      </div>
    </div>
  );
};

export default ProductPlacesSettings;