import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  SkeletonArray,
  fixNum,
} from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useFixedAssets } from '../hooks/useFixedAssets';
import { IFixedAsset } from '../types/FixedAsset';
import { SelectFixedAssetCategory } from './SelectFixedAssetCategory';

interface ISelectFixedAssetsBulkProps {
  children?: React.ReactNode;
  fixedAssetIds?: string[];
  initialFixedAssets?: IFixedAsset[];
  onSelect: (fixedAssetIds: string[], fixedAssets: IFixedAsset[]) => void;
  title?: React.ReactNode;
  submitLabel?: React.ReactNode;
  selectedLabel?: React.ReactNode;
}

interface IFixedAssetsListProps {
  selectedFixedAssetIds: string[];
  setSelectedFixedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFixedAssets: React.Dispatch<React.SetStateAction<IFixedAsset[]>>;
}

const FixedAssetListItem = ({
  fixedAsset,
  disabled,
  onSelect,
}: {
  fixedAsset: IFixedAsset;
  disabled: boolean;
  onSelect: (fixedAsset: IFixedAsset) => void;
}) => (
  <Button
    variant="ghost"
    className="min-h-9 h-auto w-full justify-start font-normal whitespace-nowrap text-left"
    disabled={disabled}
    onClick={() => onSelect(fixedAsset)}
  >
    <div className="flex flex-1 gap-2 items-center">
      <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
        {fixedAsset.code}
      </span>
      <span className="truncate">{fixedAsset.name}</span>
      <span className="ml-auto flex items-center gap-2 shrink-0">
        <span className="text-xs tabular-nums font-medium">
          {fixNum(fixedAsset.originalCost || 0).toLocaleString()}
        </span>
        <span className="text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground tabular-nums">
          {fixNum(fixedAsset.currentCount ?? fixedAsset.count ?? 0)}
        </span>
      </span>
    </div>
    <IconPlus className="ml-2 shrink-0" />
  </Button>
);

const FixedAssetsList = ({
  selectedFixedAssetIds,
  setSelectedFixedAssetIds,
  setSelectedFixedAssets,
}: IFixedAssetsListProps) => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { fixedAssets = [], loading } = useFixedAssets({
    fetchPolicy: 'network-only',
    variables: {
      searchValue: debouncedSearch,
      categoryId: categoryId || undefined,
    },
  });
  const initialLoading = loading && !fixedAssets.length;
  const availableFixedAssets = fixedAssets.filter(
    (fixedAsset) => !selectedFixedAssetIds.includes(fixedAsset._id),
  );

  const handleSelect = (fixedAsset: IFixedAsset) => {
    setSelectedFixedAssets((currentFixedAssets) => [
      ...currentFixedAssets,
      fixedAsset,
    ]);
    setSelectedFixedAssetIds((currentIds) => [...currentIds, fixedAsset._id]);
  };

  return (
    <div className="flex overflow-hidden flex-col border-r">
      <div className="p-4">
        <div className="flex gap-4 justify-between items-center">
          <Input
            placeholder="Хөрөнгө хайх"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <SelectFixedAssetCategory
            selected={categoryId}
            onSelect={(value) =>
              setCategoryId(value === categoryId ? '' : value || '')
            }
            nullable
            className="h-9 max-w-56"
          />
        </div>
        <div className="mt-4 text-xs text-accent-foreground">
          {!initialLoading && `${availableFixedAssets.length} үр дүн`}
        </div>
      </div>
      <Separator />
      <div className="overflow-auto flex-1">
        <div className="flex flex-col gap-1 p-4 min-w-max">
          {initialLoading ? (
            <SkeletonArray count={8} className="w-full h-9" />
          ) : (
            availableFixedAssets.map((fixedAsset) => (
              <FixedAssetListItem
                key={fixedAsset._id}
                fixedAsset={fixedAsset}
                disabled={
                  (fixedAsset.currentCount ?? fixedAsset.count ?? 0) <= 0
                }
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SelectedFixedAssetsList = ({
  selectedFixedAssetIds,
  selectedFixedAssets,
  setSelectedFixedAssetIds,
  setSelectedFixedAssets,
  selectedLabel,
}: IFixedAssetsListProps & {
  selectedFixedAssets: IFixedAsset[];
  selectedLabel: React.ReactNode;
}) => {
  const handleRemove = (fixedAssetId: string) => {
    setSelectedFixedAssets((currentFixedAssets) =>
      currentFixedAssets.filter(
        (fixedAsset) => fixedAsset._id !== fixedAssetId,
      ),
    );
    setSelectedFixedAssetIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== fixedAssetId),
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        <div className="px-3 mb-1 text-xs text-accent-foreground">
          {selectedLabel}
        </div>
        {selectedFixedAssetIds.map((fixedAssetId) => {
          const fixedAsset = selectedFixedAssets.find(
            (item) => item._id === fixedAssetId,
          );

          return (
            <Button
              key={fixedAssetId}
              variant="ghost"
              className="justify-start max-w-full h-auto font-normal text-left whitespace-normal min-h-9"
              onClick={() => handleRemove(fixedAssetId)}
            >
              <span className="truncate">
                {fixedAsset
                  ? `${fixedAsset.code} - ${fixedAsset.name}`
                  : fixedAssetId}
              </span>
              <IconX className="ml-auto" />
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export const SelectFixedAssetsBulk = ({
  children,
  fixedAssetIds,
  initialFixedAssets,
  onSelect,
  title = 'Олон хөрөнгө нэмэх',
  submitLabel = 'Сонгосон хөрөнгүүдийг нэмэх',
  selectedLabel = 'Сонгосон',
}: ISelectFixedAssetsBulkProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFixedAssetIds, setSelectedFixedAssetIds] = useState<string[]>(
    fixedAssetIds || [],
  );
  const [selectedFixedAssets, setSelectedFixedAssets] = useState<IFixedAsset[]>(
    initialFixedAssets || [],
  );

  const allSelectedFixedAssetsResolved = selectedFixedAssetIds.every(
    (fixedAssetId) =>
      selectedFixedAssets.some((fixedAsset) => fixedAsset._id === fixedAssetId),
  );

  const handleSelect = () => {
    onSelect(selectedFixedAssetIds, selectedFixedAssets);
    setOpen(false);
    setSelectedFixedAssetIds([]);
    setSelectedFixedAssets([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedFixedAssetIds(fixedAssetIds || []);
      setSelectedFixedAssets(initialFixedAssets || []);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {children && <Sheet.Trigger asChild>{children}</Sheet.Trigger>}
      <Sheet.View className="sm:max-w-6xl">
        <Sheet.Header>
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        {open && (
          <>
            <Sheet.Content className="grid overflow-hidden grid-cols-2">
              <FixedAssetsList
                selectedFixedAssetIds={selectedFixedAssetIds}
                setSelectedFixedAssetIds={setSelectedFixedAssetIds}
                setSelectedFixedAssets={setSelectedFixedAssets}
              />
              <SelectedFixedAssetsList
                selectedFixedAssetIds={selectedFixedAssetIds}
                selectedFixedAssets={selectedFixedAssets}
                setSelectedFixedAssetIds={setSelectedFixedAssetIds}
                setSelectedFixedAssets={setSelectedFixedAssets}
                selectedLabel={selectedLabel}
              />
            </Sheet.Content>
            <Sheet.Footer className="sm:justify-end">
              <Sheet.Close asChild>
                <Button variant="secondary" className="bg-border">
                  Болих
                </Button>
              </Sheet.Close>
              <Button
                onClick={handleSelect}
                disabled={
                  !selectedFixedAssetIds.length ||
                  !allSelectedFixedAssetsResolved
                }
              >
                {submitLabel}
              </Button>
            </Sheet.Footer>
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};
