import { IconPlus } from '@tabler/icons-react';

const ChecklistItemAdd = ({
  adding,
  setAdding,
  newItem,
  setNewItem,
  handleAdd,
  handleKeyDown,
}: {
  adding: boolean;
  setAdding: React.Dispatch<React.SetStateAction<boolean>>;
  newItem: string;
  setNewItem: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) => {
  if (adding) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <textarea
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter items, each on a new line"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Add
          </button>
          <button
            onClick={() => {
              setAdding(false);
              setNewItem('');
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 p-2 text-xs cursor-pointer hover:bg-slate-100 transition select-none"
      onClick={() => setAdding(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setAdding(true);
        }
      }}
    >
      <IconPlus size={14} />
      Add an item
    </div>
  );
};

export default ChecklistItemAdd;
