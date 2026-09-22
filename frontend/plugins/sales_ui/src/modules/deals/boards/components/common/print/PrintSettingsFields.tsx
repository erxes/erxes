import { Form, Input } from 'erxes-ui';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectBrand,
  SelectDepartments,
  SelectDocument,
} from 'ui-modules';

import {
  DEAL_DOCUMENT_CONTENT_TYPE,
  DEFAULT_PAPER_SIZE,
} from '@/deals/boards/components/common/print/constants';
import type { PrintFormValues } from '@/deals/boards/components/common/print/types';

type PrintSettingsFieldsProps = {
  form: UseFormReturn<PrintFormValues>;
};

export const PrintSettingsFields = ({ form }: PrintSettingsFieldsProps) => {
  const { t } = useTranslation('sales');

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      <Form.Field
        control={form.control}
        name="copies"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('copies')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min="1"
                {...field}
                onChange={(event) =>
                  field.onChange(Number.parseInt(event.target.value) || 1)
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="width"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('width')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min="1"
                {...field}
                onChange={(event) =>
                  field.onChange(
                    Number.parseInt(event.target.value) ||
                      DEFAULT_PAPER_SIZE.width,
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
        name="brandId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('brand')}</Form.Label>
            <SelectBrand
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('choose-brands')}
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="branchId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('branches')}</Form.Label>
            <SelectBranches.FormItem
              onValueChange={field.onChange}
              value={field.value}
              mode="single"
              className="focus-visible:relative focus-visible:z-10"
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="departmentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('department')}</Form.Label>
            <SelectDepartments.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
              className="focus-visible:relative focus-visible:z-10"
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="documentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('select-document')}</Form.Label>
            <SelectDocument.FormItem
              contentType={DEAL_DOCUMENT_CONTENT_TYPE}
              value={field.value}
              onValueChange={(value) =>
                field.onChange(Array.isArray(value) ? value[0] || '' : value)
              }
              placeholder={t('select-document')}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
