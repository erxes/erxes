import { type Product, ProductKind } from '@erxes/core-contract';
import {
  IconBarcode,
  IconCategory,
  IconHash,
  IconPlug,
  IconRuler,
  IconTag,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  MultipleSelector,
  PopoverScoped,
  RecordTableInlineCell,
  TextField,
} from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { PanelField, PanelFieldTrigger } from '~/modules/side-panel/PanelField';
import { ContactTextField } from '~/modules/side-panel/details/ContactDetailFields';
import { CategoryPicker } from '../categories/CategoryPicker';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import { useCanManageProducts } from '../useProducts';
import { useProductEdit } from './useProductEdit';

// Hotkey scopes; each field adds the product id, so stacked panels never share one.
export const PRODUCT_PANEL_SCOPE = 'product-panel';

/** Pickers drawn like the panel's other cells: no border until hovered. */
export const PANEL_PICKER_CLASS_NAME =
  'h-7 rounded-sm border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-accent';

/**
 * Read only for members without `products.manage`: every control inside is
 * disabled, its value still drawn as it is.
 */
export const ProductFieldset = ({ children }: { children: ReactNode }) => {
  const manage = useCanManageProducts();

  return (
    <fieldset
      disabled={!manage}
      className="contents [&_button:disabled]:cursor-default [&_button:disabled]:opacity-100"
    >
      {children}
    </fieldset>
  );
};

/** Edits the product's name in place, in the panel's top bar. */
export const ProductPanelName = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const edit = useProductEdit();

  return (
    <TextField
      scope={`${PRODUCT_PANEL_SCOPE}.${product.id}.name`}
      value={product.name}
      placeholder={t('fields.name', 'Name')}
      className="rounded-sm px-1 font-medium shadow-none"
      onSave={(name) => {
        const next = name.trim();

        if (next && next !== product.name) edit.mutate({ id: product.id, name: next });
      }}
    />
  );
};

/** Goods or service. */
export const ProductKindRow = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const edit = useProductEdit();
  const [open, setOpen] = useState(false);

  const label = (kind: ProductKind) =>
    kind === 'goods' ? t('kind.goods', 'Goods') : t('kind.service', 'Service');

  return (
    <PanelField icon={IconTag} label={t('fields.kind', 'Kind')}>
      <PopoverScoped
        scope={`${PRODUCT_PANEL_SCOPE}.${product.id}.kind`}
        open={open}
        onOpenChange={setOpen}
      >
        <PanelFieldTrigger>{label(product.kind)}</PanelFieldTrigger>
        <RecordTableInlineCell.Content>
          <Command>
            <Command.List className="p-1">
              {ProductKind.options.map((kind) => (
                <Command.Item
                  key={kind}
                  value={kind}
                  onSelect={() => {
                    if (kind !== product.kind) edit.mutate({ id: product.id, kind });
                    setOpen(false);
                  }}
                >
                  {label(kind)}
                  <Combobox.Check checked={kind === product.kind} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </PanelField>
  );
};

type TTextCode = 'code' | 'barcode' | 'unit';

const TEXT_FIELD_ICONS: Record<TTextCode, typeof IconHash> = {
  code: IconHash,
  barcode: IconBarcode,
  unit: IconRuler,
};

/** One text field of the product, saved without touching the others; the unit can't be empty. */
export const ProductTextRow = ({
  product,
  code,
  label,
}: {
  product: Product;
  code: TTextCode;
  label: string;
}) => {
  const edit = useProductEdit();

  const save = (next: string | null) => {
    if (code === 'unit') {
      if (next) edit.mutate({ id: product.id, unit: next });

      return;
    }

    edit.mutate({ id: product.id, [code]: next });
  };

  return (
    <PanelField icon={TEXT_FIELD_ICONS[code]} label={label}>
      <ContactTextField
        scope={`${PRODUCT_PANEL_SCOPE}.${product.id}.${code}`}
        value={product[code] ?? ''}
        placeholder={label}
        icon={TEXT_FIELD_ICONS[code]}
        onSave={save}
      />
    </PanelField>
  );
};

export const ProductCategoryRow = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const edit = useProductEdit();

  return (
    <PanelField icon={IconCategory} label={t('fields.category', 'Category')}>
      <CategoryPicker
        value={product.categoryId}
        noneLabel={t('category.none', 'No category')}
        className={PANEL_PICKER_CLASS_NAME}
        onChange={(categoryId) => {
          if (categoryId !== product.categoryId) edit.mutate({ id: product.id, categoryId });
        }}
      />
    </PanelField>
  );
};

/** "Used by": the installed plugins that list the product. */
export const ProductPluginsRow = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();
  const edit = useProductEdit();
  const { plugins, error } = useInstalledPlugins();
  const options = plugins.map((plugin) => ({ value: plugin.name, label: plugin.title }));

  return (
    <PanelField icon={IconPlug} label={t('fields.plugins', 'Used by')} cell={false}>
      <MultipleSelector
        value={product.plugins.map((name) => ({ value: name, label: pluginTitle(plugins, name) }))}
        onChange={(chosen) =>
          edit.mutate({ id: product.id, plugins: chosen.map((option) => option.value) })
        }
        options={options}
        disabled={!manage}
        placeholder={t('form.plugins-placeholder', 'Choose the apps that sell or use it')}
        emptyIndicator={
          <p className="p-2 text-center text-sm text-muted-foreground">
            {plugins.length === 0
              ? t('form.no-plugins', 'No apps installed')
              : t('form.all-plugins-chosen', 'Every installed app is chosen')}
          </p>
        }
        hidePlaceholderWhenSelected
        className="min-h-7 text-xs"
      />
      {error && <p className="text-xs text-destructive">{messageOf(error)}</p>}
    </PanelField>
  );
};
