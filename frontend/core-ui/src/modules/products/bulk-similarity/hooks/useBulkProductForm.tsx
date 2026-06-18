import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useFields } from 'ui-modules';
import {
  bulkSimilaritySchema,
  BulkSimilarityFormValues,
} from '../constants/bulkSimilaritySchema';
import { IProductSimilarity } from '../types';
import { buildRows, toSavePayload } from '../utils';

const EMPTY_VALUES: BulkSimilarityFormValues = {
  name: '',
  code: '',
  categoryId: '',
  shortName: '',
  type: '',
  description: '',
  unitPrice: 0,
  currency: '',
  uom: '',
  vendorId: '',
  scopeBrandIds: [],
  barcodeDescription: '',
  properties: [],
  rows: [],
};

const toFormValues = (
  initial?: IProductSimilarity,
): BulkSimilarityFormValues => {
  const selection = initial?.propertiesData || {};
  const fieldIds = Object.keys(selection);

  return {
    ...EMPTY_VALUES,
    ...((initial?.info as Partial<BulkSimilarityFormValues>) || {}),
    properties: fieldIds.map((fieldId) => ({
      fieldId,
      values: selection[fieldId],
    })),
    rows: buildRows({
      fieldIds,
      selection,
      code: initial?.info?.code || '',
      products: initial?.products,
      starProductId: initial?.starProductId,
      labelOf: (_fieldId, value) => value,
    }),
  };
};

export const useBulkProductForm = (initial?: IProductSimilarity) => {
  const form = useForm<BulkSimilarityFormValues>({
    resolver: zodResolver(bulkSimilaritySchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  const { control } = form;
  const { fields: fieldDefs } = useFields({ contentType: 'core:product' });

  const rows = useFieldArray({ control, name: 'rows' });

  const watchedProperties = useWatch({ control, name: 'properties' }) || [];
  const code = useWatch({ control, name: 'code' });
  const fieldIds = watchedProperties.map((p) => p.fieldId);

  const labelOf = (fieldId: string, value: string) =>
    fieldDefs
      .find((f) => f._id === fieldId)
      ?.options?.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    form.reset(toFormValues(initial));
  }, [initial?._id]);

  useEffect(() => {
    rows.replace(
      buildRows({
        fieldIds,
        selection: Object.fromEntries(
          watchedProperties.map((p) => [p.fieldId, p.values]),
        ),
        code: code || '',
        products: initial?.products,
        starProductId: initial?.starProductId,
        labelOf,
        previousRows: form.getValues('rows'),
        baseCodeDirty: (code || '') !== (initial?.info?.code || ''),
      }),
    );
    form.trigger('rows');
  }, [JSON.stringify(watchedProperties), code, initial?._id, fieldDefs.length]);

  return {
    form,
    fields: fieldDefs,
    buildSavePayload: toSavePayload,
  };
};
