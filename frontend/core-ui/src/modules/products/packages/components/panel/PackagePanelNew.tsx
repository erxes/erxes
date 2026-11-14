import { IconId, IconListCheck, IconPhoto } from '@tabler/icons-react';
import { Button, Spinner, toast } from 'erxes-ui';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type IRecordSidePanelTab,
  type IRecordViewProps,
  NEW_RECORD_ID,
  RecordSidePanel,
  useSidePanel,
} from 'ui-modules';
import { useCreatedPanelRecord } from '@/side-panel/hooks/useCreatedPanelRecord';
import { PACKAGE_CONTENT_TYPE } from '../../constants/packageContentType';
import { PACKAGE_FORM_SCHEMA } from '../../constants/packageSchema';
import { TPackagePatch } from '../../hooks/usePackagePanelSave';
import { useAddPackage } from '../../hooks/usePackageMutations';
import { IPackage, IPackageProduct } from '../../types/Package';
import { priceFromPercent } from '../../utils/packagePricing';
import { PackagePanelFields } from './PackagePanelFields';
import { PackagePanelMedia } from './PackagePanelMedia';
import { PackagePanelProducts } from './PackagePanelProducts';

const EMPTY_DRAFT: IPackage = {
  _id: NEW_RECORD_ID,
  status: 'active',
  products: [],
  tagIds: [],
};

/**
 * A package not created yet, drawn as a package is: the same header, tabs
 * and cells, each change kept in the draft until Create. The package then
 * replaces the draft; Cancel leaves nothing behind.
 */
export const PackagePanelNew = ({
  onBack,
  onClose,
}: Omit<IRecordViewProps, 'record'>) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { back, canGoBack, close } = useSidePanel();
  const showCreated = useCreatedPanelRecord(PACKAGE_CONTENT_TYPE);
  const { addPackage, loading } = useAddPackage();
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  // The checked products' total, as the product list prices them.
  const [total, setTotal] = useState<number | null>(null);
  const [tab, setTab] = useState('detail');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const latest = useRef(draft);
  // Set at once, unlike `loading`, so a second click cannot create twice.
  const creating = useRef(false);

  const save = useCallback((patch: TPackagePatch) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setDraft(next);
    // A changed field's error is out of date until the next Create.
    setErrors((current) => {
      const remaining = { ...current };
      for (const key of Object.keys(patch)) delete remaining[key];
      return remaining;
    });
    return Promise.resolve<IPackage | null>(next);
  }, []);

  const changeTotal = (next: number) => {
    const value = next || null;
    if (value === total) return;
    setTotal(value);
    void save({ price: priceFromPercent(value, latest.current.percent) });
  };

  const cancel = () => (canGoBack ? back() : close());

  const submit = async () => {
    const parsed = PACKAGE_FORM_SCHEMA.safeParse({
      ...latest.current,
      price: latest.current.price ?? null,
      percent: latest.current.percent ?? null,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        fieldErrors[field] = fieldErrors[field] || issue.message;
      }
      setErrors(fieldErrors);
      // Products are on their own tab; every other field is on Details.
      setTab(
        Object.keys(fieldErrors).every((field) => field === 'products')
          ? 'products'
          : 'detail',
      );
      toast({
        variant: 'destructive',
        title: t('check-required-fields', 'Please fill in the required fields'),
        description: parsed.error.issues[0]?.message,
      });
      return;
    }

    setErrors({});
    const { description, coverImage, tagIds, price, percent, ...values } =
      parsed.data;

    try {
      const { data } = await addPackage({
        variables: {
          ...values,
          description: description || undefined,
          coverImage: coverImage || undefined,
          tagIds: tagIds?.length ? tagIds : undefined,
          price: price ?? undefined,
          percent: percent ?? undefined,
        },
      });
      toast({ variant: 'success', title: t('package-created') });
      const created = data?.productPackagesAdd as IPackage | undefined;
      if (created?._id) showCreated(created._id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('create-failed'),
        description: (error as Error).message,
      });
    }
  };

  const create = async () => {
    if (creating.current) return;
    creating.current = true;
    try {
      await submit();
    } finally {
      creating.current = false;
    }
  };

  const props = { pkg: draft, total, save, draft: true, errors };

  const tabs: IRecordSidePanelTab[] = [
    {
      value: 'detail',
      label: t('details', 'Details'),
      icon: IconId,
      content: <PackagePanelFields {...props} />,
    },
    {
      value: 'media',
      label: t('media', 'Media'),
      icon: IconPhoto,
      content: <PackagePanelMedia {...props} />,
    },
    {
      value: 'products',
      label: t('products-count', { count: draft.products?.length ?? 0 }),
      icon: IconListCheck,
      content: (
        <PackagePanelProducts
          value={draft.products || []}
          error={errors.products}
          onChange={(products: IPackageProduct[]) => save({ products })}
          onTotalChange={changeTotal}
        />
      ),
    },
  ];

  return (
    <>
      {/* Leaving is offered again once Create has finished. */}
      <RecordSidePanel.Header
        title={t('new-package')}
        onBack={loading ? undefined : onBack}
        onClose={loading ? undefined : onClose}
      />
      {/* Details stays mounted and so does each tab once opened, and Create
          is offered on every tab. */}
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={tabs.length}
        overviewTab="detail"
      />
      <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-3 py-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={cancel}
        >
          {t('cancel')}
        </Button>
        <Button type="button" disabled={loading} onClick={create}>
          {loading && <Spinner size="sm" />}
          {t('create')}
        </Button>
      </div>
    </>
  );
};
