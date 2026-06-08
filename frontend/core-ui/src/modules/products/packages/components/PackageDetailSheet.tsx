import { IconCheck, IconPackage, IconTagPlus } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  CurrencyField,
  InfoCard,
  Input,
  Popover,
  ScrollArea,
  Select,
  Sheet,
  Spinner,
  Textarea,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import {
  ProductPrimaryImageUpload,
  SelectTags,
  TagBadge,
  type ProductAttachmentItem,
} from 'ui-modules';
import { usePackageDetail } from '../hooks/usePackageDetail';
import { useChangePackageStatus, useEditPackage } from '../hooks/usePackageMutations';
import { usePricing } from '../hooks/usePricing';
import { IPackage, IPackageProduct, PACKAGE_STATUSES } from '../types/Package';
import { PackageProductPicker } from './PackageProductPicker';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="font-medium text-sm">{children}</label>
);

const PackageTagsField = ({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((tagId) => (
        <TagBadge
          key={tagId}
          tagId={tagId}
          variant="secondary"
          onClose={
            disabled ? undefined : () => onChange(value.filter((id) => id !== tagId))
          }
        />
      ))}
      <SelectTags.Provider
        tagType="core:product"
        mode="multiple"
        value={value}
        onValueChange={(next) =>
          onChange(Array.isArray(next) ? next : next ? [next] : [])
        }
      >
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              className="size-7 shadow-xs"
            >
              <IconTagPlus className="size-4" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectTags.Content />
          </Combobox.Content>
        </Popover>
      </SelectTags.Provider>
    </div>
  );
};

const PackageDetailEditor = ({ pkg, onClose }: { pkg: IPackage; onClose: () => void }) => {
  const { changeStatus, loading: savingStatus } = useChangePackageStatus();
  const { editPackage, loading: savingEdits } = useEditPackage(pkg._id);

  const [name, setName] = useState(pkg.name || '');
  const [description, setDescription] = useState(pkg.description || '');
  const [coverImage, setCoverImage] = useState(pkg.coverImage || '');
  const [products, setProducts] = useState<IPackageProduct[]>(pkg.products || []);
  const [tagIds, setTagIds] = useState<string[]>(pkg.tagIds || []);
  const [status, setStatus] = useState(pkg.status || 'active');

  const pricing = usePricing(pkg.price, pkg.percent, pkg.totalPrice);

  const saving = savingEdits || savingStatus;

  useEffect(() => {
    setName(pkg.name || '');
    setDescription(pkg.description || '');
    setCoverImage(pkg.coverImage || '');
    setProducts(pkg.products || []);
    setTagIds(pkg.tagIds || []);
    setStatus(pkg.status || 'active');
    pricing.reset(pkg.price, pkg.percent, pkg.totalPrice);
  }, [pkg._id]);

  const basicDirty =
    name !== (pkg.name || '') ||
    description !== (pkg.description || '') ||
    coverImage !== (pkg.coverImage || '') ||
    pricing.price !== (pkg.price != null ? String(pkg.price) : '') ||
    pricing.percent !== (pkg.percent != null ? String(pkg.percent) : '') ||
    JSON.stringify(products) !== JSON.stringify(pkg.products || []) ||
    JSON.stringify(tagIds) !== JSON.stringify(pkg.tagIds || []);

  const statusDirty = status !== (pkg.status || 'active');
  const dirty = basicDirty || statusDirty;

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name is required' });
      return;
    }
    if (!products.length) {
      toast({ variant: 'destructive', title: 'At least one product is required' });
      return;
    }

    const parsedPrice = pricing.price === '' ? null : Number(pricing.price);
    if (parsedPrice != null && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      toast({ variant: 'destructive', title: 'Price must be a non-negative number' });
      return;
    }

    try {
      await Promise.all([
        basicDirty &&
          editPackage({
            variables: {
              _id: pkg._id,
              name,
              description,
              coverImage,
              price: parsedPrice,
              percent: pricing.percent !== '' ? Number(pricing.percent) : undefined,
              products: products.map(({ productId, quantity }) => ({ productId, quantity })),
              tagIds,
            },
          }),
        statusDirty && changeStatus({ variables: { _id: pkg._id, status } }),
      ].filter(Boolean));
      toast({ variant: 'success', title: 'Package updated' });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update package',
        description: e?.message,
      });
    }
  };

  return (
    <>
      <Sheet.Content className="flex flex-auto p-0 overflow-hidden">
        <ScrollArea className="border-r w-2/5 h-full shrink-0">
          <div className="flex flex-col gap-4 p-5">
            <InfoCard title="Basic information">
              <InfoCard.Content>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Status</Label>
                    <Select value={status} disabled={saving} onValueChange={setStatus}>
                      <Select.Trigger className="h-8">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {PACKAGE_STATUSES.map((s) => (
                          <Select.Item key={s} value={s}>
                            {s}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      className="min-h-20"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <Label>Tags</Label>
                    <PackageTagsField
                      value={tagIds}
                      onChange={setTagIds}
                      disabled={saving}
                    />
                  </div>
                </div>
              </InfoCard.Content>
            </InfoCard>

            <InfoCard title="Cover image">
              <InfoCard.Content>
                <ProductPrimaryImageUpload
                  value={coverImage ? { name: coverImage, url: coverImage, type: '', size: 0 } : null}
                  onChange={(v: ProductAttachmentItem | null) => setCoverImage(v?.url || '')}
                />
              </InfoCard.Content>
            </InfoCard>

            <InfoCard title="Pricing">
              <InfoCard.Content>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Price</Label>
                      {pricing.displayTotal && (
                        <span className="text-xs text-muted-foreground tabular-nums line-through">
                          {pricing.displayTotal}
                        </span>
                      )}
                    </div>
                    <CurrencyField className="w-full">
                      <CurrencyField.ValueInput
                        className="w-full"
                        value={pricing.price ? Number(pricing.price) : 0}
                        onChange={pricing.onPriceChange}
                        disabled={saving}
                      />
                    </CurrencyField>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Percent</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      placeholder="0"
                      value={pricing.percent}
                      onChange={(e) => pricing.onPercentChange(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>
              </InfoCard.Content>
            </InfoCard>
          </div>
        </ScrollArea>

        <div className="flex flex-col flex-auto h-full overflow-hidden p-5 bg-muted/20">
          <PackageProductPicker
            value={products}
            onChange={(items: IPackageProduct[]) => setProducts(items)}
            onTotalChange={pricing.onTotalChange}
            disabled={saving}
          />
        </div>
      </Sheet.Content>

      <Sheet.Footer className="flex-none items-center gap-2">
        {dirty && <Badge variant="default">Unsaved changes</Badge>}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={handleSave} disabled={!dirty || saving} className="gap-2">
            <IconCheck className="size-4" />
            Save
          </Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

export const PackageDetailSheet = () => {
  const [activePackageId, setActivePackageId] = useQueryState<string>('activePackageId');
  const { package: pkg, loading } = usePackageDetail(activePackageId);

  const handleClose = () => setActivePackageId(null);

  return (
    <Sheet
      open={!!activePackageId}
      onOpenChange={(open) => { if (!open) handleClose(); }}
    >
      <Sheet.View className="p-0 sm:max-w-5xl">
        <div className="flex flex-col flex-auto overflow-hidden">
          <Sheet.Header className="flex gap-2">
            <IconPackage />
            <Sheet.Title>{pkg?.name || 'Package detail'}</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>

          {loading && !pkg ? (
            <>
              <div className="flex flex-auto justify-center items-center">
                <Spinner />
              </div>
              <Sheet.Footer className="flex-none">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </Sheet.Footer>
            </>
          ) : pkg ? (
            <PackageDetailEditor pkg={pkg} onClose={handleClose} />
          ) : (
            <>
              <div className="flex flex-auto justify-center items-center p-6 text-muted-foreground text-sm">
                Package not found
              </div>
              <Sheet.Footer className="flex-none">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </Sheet.Footer>
            </>
          )}
        </div>
      </Sheet.View>
    </Sheet>
  );
};
