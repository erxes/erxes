import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFields } from 'ui-modules';
import {
  bulkSimilaritySchema,
  BulkSimilarityFormValues,
} from '../constants/bulkSimilaritySchema';
import {
  IBulkRow,
  IBulkSaveInput,
  IMatrixRow,
  IProductSimilarity,
} from '../types';
import { buildMatrix } from '../utils';

const EMPTY_INFO: BulkSimilarityFormValues = {
  name: '',
  baseCode: '',
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
};

export const useBulkProductForm = (initial?: IProductSimilarity) => {
  const form = useForm<BulkSimilarityFormValues>({
    resolver: zodResolver(bulkSimilaritySchema),
    defaultValues: EMPTY_INFO,
  });

  const info = form.watch();

  const [selection, setSelection] = useState<Record<string, string[]>>(
    initial?.propertiesData || {},
  );

  const [fieldIds, setFieldIds] = useState<string[]>(
    Object.keys(initial?.propertiesData || {}),
  );

  useEffect(() => {
    form.reset({
      ...EMPTY_INFO,
      ...((initial?.info as Partial<BulkSimilarityFormValues>) || {}),
    });
    setSelection(initial?.propertiesData || {});
    setFieldIds(Object.keys(initial?.propertiesData || {}));
  }, [initial?._id]);

  const [overrides, setOverrides] = useState<
    Record<string, { code?: string; unitPrice?: number; isExcluded?: boolean }>
  >({});
  const [starRowKey, setStarRowKey] = useState<string | undefined>(undefined);

  const { fields } = useFields({ contentType: 'core:product' });

  const labelOf = useCallback(
    (fieldId: string, value: string) => {
      const field = fields.find((f) => f._id === fieldId);
      const option = field?.options?.find((o) => o.value === value);
      return option?.label ?? value;
    },
    [fields],
  );

  const matrix: IMatrixRow[] = useMemo(() => {
    const base = buildMatrix({
      fieldIds,
      selection,
      baseCode: info.baseCode || '',
      products: initial?.products,
      starProductId: initial?.starProductId,
      labelOf,
    });

    return base.map((row) => {
      const ov = overrides[row.key] || {};
      return {
        ...row,
        code: ov.code ?? row.code,
        unitPrice: ov.unitPrice ?? row.unitPrice,
        isExcluded: ov.isExcluded ?? row.isExcluded,
        isStar: starRowKey ? row.key === starRowKey : row.isStar,
      };
    });
  }, [
    fieldIds,
    selection,
    info.baseCode,
    initial?.products,
    initial?.starProductId,
    labelOf,
    overrides,
    starRowKey,
  ]);

  const toggleFieldValue = useCallback(
    (fieldId: string, value: string) => {
      setFieldIds((prev) => (prev.includes(fieldId) ? prev : [...prev, fieldId]));
      setSelection((prev) => {
        const current = prev[fieldId] || [];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [fieldId]: next };
      });
    },
    [],
  );

  const setFieldValues = useCallback((fieldId: string, values: string[]) => {
    setFieldIds((prev) => (prev.includes(fieldId) ? prev : [...prev, fieldId]));
    setSelection((prev) => ({ ...prev, [fieldId]: values }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFieldIds((prev) => prev.filter((id) => id !== fieldId));
    setSelection((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const setRowCode = useCallback((key: string, code: string) => {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], code } }));
  }, []);

  const setRowPrice = useCallback((key: string, unitPrice?: number) => {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], unitPrice } }));
  }, []);

  const toggleRowExcluded = useCallback((key: string, current?: boolean) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], isExcluded: !current },
    }));
  }, []);

  const setAllExcluded = useCallback(
    (isExcluded: boolean) => {
      setOverrides((prev) => {
        const next = { ...prev };
        for (const row of matrix) {
          next[row.key] = { ...next[row.key], isExcluded };
        }
        return next;
      });
    },
    [matrix],
  );

  const duplicateCodes = useMemo(() => {
    const seen = new Map<string, number>();
    for (const row of matrix) {
      if (row.isExcluded) continue;
      seen.set(row.code, (seen.get(row.code) || 0) + 1);
    }
    return new Set(
      [...seen.entries()].filter(([, n]) => n > 1).map(([code]) => code),
    );
  }, [matrix]);

  const includedCount = useMemo(
    () => matrix.filter((r) => !r.isExcluded).length,
    [matrix],
  );

  const validation = useMemo(() => {
    const errors: string[] = [];

    if (duplicateCodes.size > 0) {
      errors.push(
        `${duplicateCodes.size} duplicate ${
          duplicateCodes.size === 1 ? 'code' : 'codes'
        } across included products.`,
      );
    }

    return { errors, canSave: errors.length === 0 };
  }, [duplicateCodes]);

  const buildSavePayload = useCallback(
    (values: BulkSimilarityFormValues): IBulkSaveInput => {
      const rows: IBulkRow[] = matrix.map((row) => ({
        productId: row.productId,
        code: row.code,
        unitPrice: row.unitPrice,
        isExcluded: row.isExcluded,
      }));

      return {
        info: values,
        propertiesData: selection,
        rows,
        starRowKey,
      };
    },
    [matrix, selection, starRowKey],
  );

  return {
    form,
    info,
    selection,
    fieldIds,
    fields,
    matrix,
    starRowKey,
    setStarRowKey,
    toggleFieldValue,
    setFieldValues,
    removeField,
    setRowCode,
    setRowPrice,
    toggleRowExcluded,
    setAllExcluded,
    labelOf,
    duplicateCodes,
    includedCount,
    validation,
    buildSavePayload,
  };
};
