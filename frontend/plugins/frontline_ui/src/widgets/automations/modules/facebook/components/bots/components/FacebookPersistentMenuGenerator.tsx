import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { Button, Card, cn, Input, Select } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import { TFacebookBotForm } from '../states/facebookBotForm';

type TPersistentMenu = TFacebookBotForm['persistentMenus'][number];
type TPersistentMenuType = TPersistentMenu['type'];

const PERSISTENT_MENU_TYPES: {
  value: TPersistentMenuType;
  label: string;
}[] = [
  { value: 'button', label: 'Button' },
  { value: 'link', label: 'Link' },
  { value: 'human_handoff', label: 'Talk to human' },
  { value: 'back_button', label: 'Back' },
];

const isPersistentMenuType = (value: string): value is TPersistentMenuType =>
  PERSISTENT_MENU_TYPES.some((type) => type.value === value);

export const FacebookPersistentMenuGenerator = ({
  menus = [],
  setMenus,
  limit,
}: {
  menus: TPersistentMenu[];
  setMenus: (menus: TPersistentMenu[]) => void;
  limit: number;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = menus.findIndex((menu) => menu._id === active.id);
    const newIndex = menus.findIndex((menu) => menu._id === over.id);

    setMenus(arrayMove(menus, oldIndex, newIndex));
  };

  const handleChangeMenu = (updatedMenu: TPersistentMenu) => {
    setMenus(
      menus.map((menu) => (menu._id === updatedMenu._id ? updatedMenu : menu)),
    );
  };

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      {
        _id: generateAutomationElementId(),
        text: `Persistent Menu ${menus.length + 1}`,
        type: 'button',
        link: '',
      },
    ]);
  };

  const handleRemoveMenu = (menuId: string) => {
    setMenus(menus.filter((menu) => menu._id !== menuId));
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={menus.map((menu) => menu._id)}
          strategy={verticalListSortingStrategy}
        >
          {menus.map((menu) => (
            <FacebookPersistentMenuRow
              key={menu._id}
              menu={menu}
              hasAnotherBackButton={menus.some(
                (item) => item._id !== menu._id && item.type === 'back_button',
              )}
              onChange={handleChangeMenu}
              onRemove={() => handleRemoveMenu(menu._id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="secondary"
        className="w-full font-mono uppercase font-semibold text-xs text-accent-foreground"
        disabled={menus.length >= limit}
        onClick={handleAddMenu}
      >
        <IconPlus />
        Add persistent menu
      </Button>
    </div>
  );
};

const FacebookPersistentMenuRow = ({
  menu,
  hasAnotherBackButton,
  onChange,
  onRemove,
}: {
  menu: TPersistentMenu;
  hasAnotherBackButton: boolean;
  onChange: (menu: TPersistentMenu) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: menu._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTypeChange = (value: string) => {
    if (!isPersistentMenuType(value)) {
      return;
    }

    onChange({
      ...menu,
      type: value,
      text: value === 'back_button' ? 'Back' : menu.text,
      link: value === 'link' ? menu.link || '' : '',
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="px-3 py-2 flex flex-col gap-2 rounded"
    >
      <div className="flex flex-row gap-2 items-center">
        <div
          {...listeners}
          role="button"
          aria-label="Drag to reorder menu"
          tabIndex={0}
          className="p-2 rounded hover:bg-muted text-accent-foreground cursor-grab active:cursor-grabbing"
        >
          <IconGripVertical className="w-4 h-4" />
        </div>
        <Select value={menu.type} onValueChange={handleTypeChange}>
          <Select.Trigger className="w-36">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {PERSISTENT_MENU_TYPES.map(({ value, label }) => (
              <Select.Item
                key={value}
                value={value}
                disabled={value === 'back_button' && hasAnotherBackButton}
              >
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        {menu.type !== 'back_button' && (
          <Input
            maxLength={20}
            placeholder="Menu label"
            value={menu.text}
            onChange={(event) =>
              onChange({ ...menu, text: event.currentTarget.value })
            }
          />
        )}
        <Button
          size="icon"
          variant="destructive"
          aria-label={`Remove menu: ${menu.text || 'untitled'}`}
          onClick={onRemove}
        >
          <IconX />
        </Button>
      </div>
      <Input
        className={cn(menu.type !== 'link' && 'hidden')}
        type="url"
        placeholder="https://..."
        value={menu.link || ''}
        onChange={(event) =>
          onChange({ ...menu, link: event.currentTarget.value })
        }
      />
    </Card>
  );
};
