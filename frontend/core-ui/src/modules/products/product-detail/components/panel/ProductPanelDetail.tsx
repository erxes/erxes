import { IconAlignLeft } from '@tabler/icons-react';
import { Editor, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionCreateFields,
  PanelDescriptionField,
  usePanelExpanded,
} from 'ui-modules';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import {
  ProductPanelFields,
  TProductPanelFieldsProps,
} from './ProductPanelFields';

// A draft's description, kept as it is typed: Create may come before the
// editor is left. Read-only, it is only shown.
const DraftDescriptionField = ({
  label,
  value,
  scope,
  readonly,
  onChange,
}: {
  label: string;
  value: string;
  scope: string;
  readonly?: boolean;
  onChange: (description: string) => void;
}) => (
  <div className="flex flex-col gap-1.5 pt-2">
    <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
      <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
    <Editor
      initialContent={value}
      onChange={onChange}
      scope={scope}
      readonly={readonly}
      className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
    />
  </div>
);

// The Detail tab: the fields, then the description. On the product's page
// the fields stand alone, as the description has its own tab there.
export const ProductPanelDetail = (props: TProductPanelFieldsProps) => {
  const { product, save, draft, readOnly } = props;
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const expanded = usePanelExpanded();

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-5 p-3">
        <ProductPanelFields {...props} />
        {draft ? (
          <>
            <DraftDescriptionField
              label={t('description')}
              value={product.description || ''}
              scope="side-panel-product-new.description"
              onChange={(description) => save({ description })}
            />
            <DataExtensionCreateFields
              recordType={PRODUCT_CONTENT_TYPE}
              layout="stack"
            />
          </>
        ) : (
          !expanded &&
          (readOnly ? (
            <DraftDescriptionField
              key={product._id}
              label={t('description')}
              value={product.description || ''}
              scope={`side-panel-product.${product._id}.description`}
              readonly
              onChange={() => undefined}
            />
          ) : (
            <PanelDescriptionField
              key={product._id}
              label={t('description')}
              value={product.description || ''}
              scope={`side-panel-product.${product._id}.description`}
              onSave={(description) => save({ description })}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};
