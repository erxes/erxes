import { useAtom } from 'jotai';
import { useState } from 'react';
import { posCategoryAtom } from '../../states/posCategory';
import { Button } from 'erxes-ui';

export default function ChooseCategoryPage() {
  const [posCategory, setPosCategory] = useAtom(posCategoryAtom);
  const [selectedCategory, setSelectedCategory] = useState<
    'restaurant' | 'ecommerce' | 'kiosk' | null
  >(posCategory || null);

  const handleCategorySelect = (
    category: 'restaurant' | 'ecommerce' | 'kiosk',
  ) => {
    setSelectedCategory(category);
    setPosCategory(category);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="h-48 overflow-hidden">
            <img
              src="/ecommercee.png"
              alt="E-commerce POS"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">E-commerce</h3>
              <Button
                onClick={() => handleCategorySelect('ecommerce')}
                variant={
                  selectedCategory === 'ecommerce' ? 'default' : 'outline'
                }
                size="sm"
                className={
                  selectedCategory === 'ecommerce'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                {selectedCategory === 'ecommerce' ? 'Selected' : 'Choose'}
              </Button>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="h-48 overflow-hidden">
            <img
              src="../../../assets/restaurant.png"
              alt="Restaurant POS"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Restaurant</h3>
              <Button
                onClick={() => handleCategorySelect('restaurant')}
                variant={
                  selectedCategory === 'restaurant' ? 'default' : 'outline'
                }
                size="sm"
                className={
                  selectedCategory === 'restaurant'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                {selectedCategory === 'restaurant' ? 'Selected' : 'Choose'}
              </Button>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="h-48 overflow-hidden">
            <img
              src="/placeholder.svg?height=192&width=384"
              alt="Kiosk POS"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Kiosk</h3>
              <Button
                onClick={() => handleCategorySelect('kiosk')}
                variant={selectedCategory === 'kiosk' ? 'default' : 'outline'}
                size="sm"
                className={
                  selectedCategory === 'kiosk'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                {selectedCategory === 'kiosk' ? 'Selected' : 'Choose'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
