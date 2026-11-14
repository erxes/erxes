import { IconBarcode, IconForms, IconId, IconPhoto } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner, toast } from 'erxes-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FieldsInDetail,
  type IFieldMutation,
  IProductFormValues,
  type IRecordSidePanelTab,
  type IRecordViewProps,
  NEW_RECORD_ID,
  PRODUCT_FORM_SCHEMA,
  RecordSidePanel,
  type SubUomItem,
  useFieldGroups,
  useSidePanel,
} from 'ui-modules';
import { useProductFileLinks } from 'ui-modules/modules/products/hooks/useProductFiles';
import { useAddProduct } from 'ui-modules/modules/products/hooks/useProductsAdd';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import { productsQueries } from '@/products/graphql';
import { TProductPatch } from '@/products/product-detail/hooks/useProductPanelSave';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';
import { getProductFormDefaultValues } from '@/products/product-detail/utils/productFormValues';
import { useCreatedPanelRecord } from '@/side-panel/hooks/useCreatedPanelRecord';
import { ProductPanelDetail } from './ProductPanelDetail';
import { ProductPanelInventory } from './ProductPanelInventory';
import { ProductPanelMedia } from './ProductPanelMedia';

type TProductDraft = ProductDetail & { _id: string };

const EMPTY_DRAFT: TProductDraft = {
  _id: NEW_RECORD_ID,
  type: 'product',
  unitPrice: 0,
};

// Cells save as they close and the editor reports this long after a
// keystroke; Create waits for both before reading the draft.
const SETTLE_MS = 350;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

// A change to a draft: the product forms' `customFieldsData` is the
// product's `propertiesData`.
const applyPatch = (
  draft: TProductDraft,
  { customFieldsData, durationType, ...rest }: TProductPatch,
): TProductDraft => {
  const next: TProductDraft = { ...draft, ...rest };
  if (customFieldsData !== undefined) next.propertiesData = customFieldsData;
  // The form clears it with `null`; a product has none then.
  if (durationType !== undefined) next.durationType = durationType ?? undefined;
  return next;
};

// The form's values as `productsAdd` variables, as the product forms send
// them: empty values left out, properties as `propertiesData`.
const toProductAddVariables = (values: IProductFormValues) => {
  const { barcodes, variants, customFieldsData, subUoms, ...rest } = values;
  const variables: Record<string, unknown> = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => !isEmpty(value)),
  );
  const variantsMap = (variants || {}) as Record<
    string,
    { name?: string; image?: unknown }
  >;
  const properties = Object.fromEntries(
    Object.entries((customFieldsData || {}) as Record<string, unknown>).filter(
      ([, value]) => !isEmpty(value),
    ),
  );

  if (barcodes?.length) variables.barcodes = barcodes;
  if (Object.values(variantsMap).some((v) => v?.name || v?.image)) {
    variables.variants = variantsMap;
  }
  if (Object.keys(properties).length) variables.propertiesData = properties;
  if (Array.isArray(subUoms) && subUoms.length) {
    variables.subUoms = (subUoms as SubUomItem[]).map((subUom) => {
      const rest = { ...subUom };
      delete rest._id;
      return rest;
    });
  }

  return variables;
};

// Properties of a draft are kept in it, not saved to a product.
const DraftPropertiesContext = createContext<
  (propertiesData: Record<string, unknown>) => void
>(() => undefined);

const useDraftPropertiesEdit = (): IFieldMutation => {
  const setProperties = useContext(DraftPropertiesContext);
  return {
    mutate: ({ propertiesData }, callbacks) => {
      setProperties(isRecord(propertiesData) ? propertiesData : {});
      callbacks?.onCompleted?.();
    },
    loading: false,
  };
};

/**
 * A product not created yet, drawn as a product is: the same header, tabs
 * and cells, each change kept in the draft until Create. The product then
 * replaces the draft; Cancel leaves nothing behind. Activity and the
 * similarity group come once it exists.
 */
export const ProductPanelNew = ({
  onBack,
  onClose,
}: Omit<IRecordViewProps, 'record'>) => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { t: detailT } = useTranslation('product', { keyPrefix: 'detail' });
  const { t: rootT } = useTranslation('product');
  const { back, canGoBack, close } = useSidePanel();
  const showCreated = useCreatedPanelRecord(PRODUCT_CONTENT_TYPE);
  const { productsAdd, loading } = useAddProduct();
  const { linkFiles, linking } = useProductFileLinks();
  const { fieldGroups } = useFieldGroups({ contentType: PRODUCT_CONTENT_TYPE });
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [tab, setTab] = useState('detail');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [settling, setSettling] = useState(false);
  const latest = useRef(draft);
  latest.current = draft;
  // Set at once, unlike `busy`, so a second click cannot create twice.
  const creating = useRef(false);
  // A panel closed before Create sends the product leaves none behind.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = useCallback((patch: TProductPatch) => {
    const next = applyPatch(latest.current, patch);
    latest.current = next;
    setDraft((current) => applyPatch(current, patch));
    // A changed field's error is out of date until the next Create.
    setErrors((current) => {
      const remaining = { ...current };
      for (const key of Object.keys(patch)) delete remaining[key];
      return remaining;
    });
    return Promise.resolve<ProductDetail | null>(next);
  }, []);

  const setProperties = useCallback(
    (propertiesData: Record<string, unknown>) =>
      setDraft((current) => ({ ...current, propertiesData })),
    [],
  );

  const cancel = () => (canGoBack ? back() : close());

  const create = async () => {
    if (creating.current) return;
    creating.current = true;
    try {
      await submit();
    } finally {
      creating.current = false;
    }
  };

  const submit = async () => {
    setSettling(true);
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
    if (!mounted.current) return;
    setSettling(false);

    const parsed = PRODUCT_FORM_SCHEMA.safeParse(
      getProductFormDefaultValues(latest.current),
    );

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        fieldErrors[field] = fieldErrors[field] || issue.message;
      }
      setErrors(fieldErrors);
      setTab('detail');
      toast({
        title: detailT('validationErrorTitle'),
        description: parsed.error.issues[0]?.message,
        variant: 'destructive',
      });
      return;
    }

    setErrors({});
    // Files get their public links only now, so a cancelled draft leaves none.
    const files = await linkFiles(parsed.data.files);

    if (!files || !mounted.current) return;

    await productsAdd({
      variables: toProductAddVariables({ ...parsed.data, files }),
      refetchQueries: [productsQueries.productsMain],
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
      onCompleted: ({ productsAdd: created }) => {
        toast({
          title: t('success'),
          description: t('product-created', 'Product created successfully'),
          variant: 'success',
        });
        showCreated(created._id);
      },
    });
  };

  const props = { product: draft, save, draft: true, errors };

  const tabs: IRecordSidePanelTab[] = [
    {
      value: 'detail',
      label: detailT('details', 'Details'),
      icon: IconId,
      content: <ProductPanelDetail {...props} />,
    },
    {
      value: 'media',
      label: detailT('media', 'Media'),
      icon: IconPhoto,
      content: <ProductPanelMedia {...props} />,
    },
    {
      value: 'inventory',
      label: detailT('barcodes'),
      icon: IconBarcode,
      content: <ProductPanelInventory {...props} />,
    },
    // Only when products have properties to fill in.
    ...(fieldGroups.length > 0
      ? [
          {
            value: 'properties',
            label: detailT('properties', 'Properties'),
            icon: IconForms,
            content: (
              <ScrollArea
                className="flex-1 min-h-0"
                viewportClassName="[&>div]:block!"
              >
                <div className="p-3">
                  <DraftPropertiesContext.Provider value={setProperties}>
                    <FieldsInDetail
                      bare
                      fieldContentType={PRODUCT_CONTENT_TYPE}
                      propertiesData={draft.propertiesData || {}}
                      mutateHook={useDraftPropertiesEdit}
                      id={draft._id}
                    />
                  </DraftPropertiesContext.Provider>
                </div>
              </ScrollArea>
            ),
          },
        ]
      : []),
  ];

  const busy = settling || loading || linking;

  return (
    <>
      {/* Leaving is offered again once Create has finished. */}
      <RecordSidePanel.Header
        title={rootT('new-product')}
        onBack={busy ? undefined : onBack}
        onClose={busy ? undefined : onClose}
      />
      {/* Details stays mounted and so does each tab once opened: Data
          Extension values live in their fields, and Create is offered on
          every tab. */}
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
          disabled={busy}
          onClick={cancel}
        >
          {t('cancel')}
        </Button>
        <Button type="button" disabled={busy} onClick={create}>
          {busy && <Spinner size="sm" />}
          {busy ? t('creating') : t('create-product')}
        </Button>
      </div>
    </>
  );
};
