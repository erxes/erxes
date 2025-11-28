import { useAtom } from 'jotai';
import { useState } from 'react';
import { posCategoryAtom } from '../../states/posCategory';
import { Button } from 'erxes-ui';

type CategoryId = 'ecommerce' | 'restaurant' | 'kiosk';

const categories: {
  id: CategoryId;
  title: string;
  image: string;
  alt: string;
}[] = [
  {
    id: 'ecommerce',
    title: 'E-commerce',
    image: 'https://placehold.co/150x150',
    alt: 'E-commerce POS',
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    image: 'https://placehold.co/150x150',
    alt: 'Restaurant POS',
  },
  {
    id: 'kiosk',
    title: 'Kiosk',
    image: 'https://placehold.co/150x150',
    alt: 'Kiosk POS',
  },
];

export default function ChooseCategoryPage() {
  const [posCategory, setPosCategory] = useAtom(posCategoryAtom);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    (posCategory as CategoryId | null) || null,
  );

  const handleCategorySelect = (category: CategoryId) => {
    setSelectedCategory(category);
    setPosCategory(category);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="overflow-hidden relative rounded-lg border shadow-sm"
          >
            <div className="overflow-hidden h-48">
              <img
                src={cat.image}
                alt={cat.alt}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{cat.title}</h3>
                <Button
                  onClick={() => handleCategorySelect(cat.id)}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  className={
                    selectedCategory === cat.id
                      ? 'bg-green-600 hover:bg-green-700 border-none'
                      : ''
                  }
                >
                  {selectedCategory === cat.id ? 'Selected' : 'Choose'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
