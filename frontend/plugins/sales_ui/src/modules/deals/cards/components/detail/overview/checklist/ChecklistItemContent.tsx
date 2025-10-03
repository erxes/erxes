import { IconDotsVertical, IconRefresh, IconTrash } from '@tabler/icons-react';

import { Checkbox } from 'erxes-ui';
import { IChecklistItem } from '@/deals/types/checklists';
import { useChecklistItemsEdit } from '@/deals/cards/hooks/useChecklists';
import { useState } from 'react';

const ChecklistItemContent = ({
  item,
  index,
  setItems,
}: {
  item: IChecklistItem;
  index: number;
  setItems: React.Dispatch<React.SetStateAction<IChecklistItem[]>>;
}) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const { salesChecklistItemsEdit } = useChecklistItemsEdit();

  const toggleChecked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isChecked: !item.isChecked } : item,
      ),
    );
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onChangeChecked = (id: string) => {
    toggleChecked(item._id);

    salesChecklistItemsEdit({
      variables: {
        _id: id,
        isChecked: !item.isChecked,
      },
    });
  };

  return (
    <div
      key={item._id}
      className="border-b border-gray-100 pointer-events-auto flex items-center justify-between p-1 gap-2 group relative"
    >
      <div className="flex items-center gap-2 text-xs">
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={item.isChecked || false}
            onCheckedChange={() => onChangeChecked(item._id)}
          />
        </div>
        <span
          className={`text-xs ${
            item.isChecked ? 'line-through text-gray-400' : ''
          } select-none`}
        >
          {item.content}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={(e) => {
            setActiveMenuIndex(activeMenuIndex === index ? null : index);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition"
          aria-label="More actions"
        >
          <IconDotsVertical size={18} />
        </button>

        {activeMenuIndex === index && (
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white border rounded shadow-md">
            <button
              onClick={() => {
                setActiveMenuIndex(null);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-sm"
            >
              <IconRefresh size={16} />
              Convert to deal
            </button>
            <button
              onClick={() => {
                handleRemove(index);
                setActiveMenuIndex(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full text-sm"
            >
              <IconTrash size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistItemContent;
