import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { Button, Input, useConfirm, useToast } from 'erxes-ui';
import { useState, useMemo } from 'react';

import { IElement } from '../../../elements/types/element';
import { ElementCreateSheet } from '../../../elements/_components/ElementCreateSheet';
import { ElementEditSheet } from '../../../elements/_components/ElementEditSheet';
import { useRemoveElements } from '../../../elements/hooks/useRemoveElements';

interface ElementsPanelProps {
  elements: IElement[];
  onDragStart: (element: IElement) => void;
  onDragEnd: () => void;
  branchId?: string;
  mainLanguage?: string;
  branchLanguages?: string[];
}

export const ElementsPanel = ({
  elements,
  onDragStart,
  onDragEnd,
  branchId,
  mainLanguage,
  branchLanguages,
}: ElementsPanelProps) => {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editElement, setEditElement] = useState<IElement | null>(null);

  const { removeElements } = useRemoveElements();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const confirmOptions = { confirmationValue: 'delete' };

  const filteredElements = useMemo(() => {
    if (!search.trim()) return elements;

    const searchLower = search.toLowerCase();

    return elements.filter((el) =>
      el.name?.toLowerCase().includes(searchLower),
    );
  }, [elements, search]);

  const handleCreateOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCreateOpen(true);
  };

  const handleDelete = async (element: IElement) => {
    try {
      await confirm({
        message: `Are you sure you want to delete "${element.name}"?`,
        options: confirmOptions,
      });

      await removeElements([element._id]);

      toast({
        title: 'Success',
        description: 'Element deleted successfully',
        variant: 'success',
      });
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <ElementCreateSheet
        branchId={branchId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        showTrigger={false}
        mainLanguage={mainLanguage}
        branchLanguages={branchLanguages}
      />

      {editElement && (
        <ElementEditSheet
          element={editElement}
          open={!!editElement}
          onOpenChange={(open) => !open && setEditElement(null)}
          showTrigger={false}
          mainLanguage={mainLanguage}
          branchLanguages={branchLanguages}
        />
      )}

      <div className="flex flex-col h-full">
        <div className="p-3 border-b">
          <div className="grid grid-cols-10 gap-2 items-center">
            <div className="relative col-span-7">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                placeholder="Search elements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              type="button"
              className="col-span-3 h-8"
              onClick={handleCreateOpen}
            >
              <IconPlus size={16} />
              Add Element
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {!filteredElements.length && (
            <p className="py-6 text-sm text-center text-muted-foreground">
              {search ? 'No elements found' : 'No elements available'}
            </p>
          )}

          {filteredElements.map((element) => (
            <div
              key={element._id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(element);
              }}
              onDragEnd={onDragEnd}
              className="p-3 rounded border transition-shadow bg-card cursor-grab active:cursor-grabbing hover:shadow-md"
            >
              <div className="flex gap-2 justify-between place-items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{element.name}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="w-6 h-6"
                    aria-label="Edit element"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditElement(element);
                    }}
                  >
                    <IconEdit size={12} />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="w-6 h-6"
                    aria-label="Delete element"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(element);
                    }}
                  >
                    <IconTrash size={12} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
