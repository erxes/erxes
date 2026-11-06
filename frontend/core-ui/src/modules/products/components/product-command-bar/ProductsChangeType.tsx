import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconBox } from '@tabler/icons-react';
import { Button, Command, Form, Input, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  productTypeChangeSchema,
  PRODUCT_TYPE_CHANGE_DURATION_UNITS,
  PRODUCT_TYPE_CHANGE_TYPES,
} from '@/products/constants/productTypeChangeSchema';
import type {
  ProductsChangeTypeContentProps,
  ProductTypeChangeValues,
} from '@/products/types/productTypeChange';

export const ProductsChangeTypeContent = ({
  products,
  changeType,
  onClose,
}: ProductsChangeTypeContentProps) => {
  const { t } = useTranslation('product');
  const [uniqueOpen, setUniqueOpen] = useState(false);
  const { apply, saving, refreshPending } = changeType;
  const editableCount = products.filter((p) => p.status !== 'deleted').length;
  const skippedCount = products.length - editableCount;

  if (refreshPending) {
    return (
      <div className="space-y-3 p-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'bulk.type-saved-refresh-needed',
            'Changes saved. Refresh the product list to continue.',
          )}
        </p>
        <Button
          className="w-full"
          disabled={saving}
          onClick={async () => {
            if (await apply()) onClose();
          }}
        >
          {saving && <Spinner containerClassName="inline-flex flex-none" />}
          {t('bulk.retry-refresh', 'Retry refresh')}
        </Button>
      </div>
    );
  }

  if (uniqueOpen) {
    return (
      <ProductsChangeUniqueTypeForm
        changeType={changeType}
        onClose={onClose}
        onBack={() => setUniqueOpen(false)}
        disabled={!editableCount}
      />
    );
  }

  return (
    <Command>
      <Command.Input
        placeholder={t('bulk.search-types', 'Search types')}
        disabled={saving}
        focusOnMount
      />
      <Command.List>
        <Command.Empty>
          {t('bulk.no-types-found', 'No types found')}
        </Command.Empty>
        <Command.Group>
          {PRODUCT_TYPE_CHANGE_TYPES.map((type) => (
            <Command.Item
              key={type}
              value={type}
              className="capitalize"
              disabled={saving || !editableCount}
              onSelect={async () => {
                if (type === 'unique') {
                  setUniqueOpen(true);
                  return;
                }
                if (await apply({ type })) onClose();
              }}
            >
              <IconBox />
              {t(`bulk.type-${type}`, type)}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      {saving && (
        <div className="flex items-center gap-2 border-t p-2 text-xs text-muted-foreground">
          <Spinner containerClassName="inline-flex flex-none" />
          {t('saving', 'Saving...')}
        </div>
      )}
      {skippedCount > 0 && (
        <p className="border-t p-2 text-xs text-muted-foreground">
          {t(
            'bulk.type-deleted-skipped',
            '{{count}} deleted products will be skipped.',
            { count: skippedCount },
          )}
        </p>
      )}
    </Command>
  );
};

const ProductsChangeUniqueTypeForm = ({
  changeType,
  onClose,
  onBack,
  disabled,
}: Pick<ProductsChangeTypeContentProps, 'changeType' | 'onClose'> & {
  onBack: () => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation('product');
  const { apply, saving } = changeType;
  const form = useForm<ProductTypeChangeValues>({
    resolver: zodResolver(productTypeChangeSchema),
    defaultValues: { type: 'unique' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          if (await apply(values)) onClose();
        })}
      >
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-none border-b"
          disabled={saving}
          aria-label={t('bulk.back-to-types', 'Back to types')}
          onClick={onBack}
        >
          <IconArrowLeft />
          {t('unique', 'Unique')}
        </Button>
        <fieldset
          disabled={saving}
          className="space-y-3 p-3 disabled:pointer-events-none"
        >
          <Form.Field
            control={form.control}
            name="duration"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('duration', 'Duration')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="any"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="durationType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('duration-type', 'Duration type')}</Form.Label>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={t('duration-type', 'Duration type')}
                      />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {PRODUCT_TYPE_CHANGE_DURATION_UNITS.map((unit) => (
                      <Select.Item
                        key={unit}
                        value={unit}
                        className="capitalize"
                      >
                        {t(`duration-unit-${unit}`, unit)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={disabled || saving}
          >
            {saving && <Spinner containerClassName="inline-flex flex-none" />}
            {t('bulk.change-type', 'Change type')}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
};
