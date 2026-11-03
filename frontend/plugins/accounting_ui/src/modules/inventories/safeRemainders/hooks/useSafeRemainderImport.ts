import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TSafeRemainderImportItem } from '@/inventories/safeRemainders/types/SafeRemainder';
import {
  mapSafeRemainderCsv,
  parseSafeRemainderText,
  previewSafeRemainderCsv,
  SafeRemainderCsvPreview,
  suggestSafeRemainderCsvMapping,
} from '@/inventories/safeRemainders/utils/parseSafeRemainderImport';

export type SafeRemainderImportFormat = 'csv' | 'txt';

export interface SafeRemainderImportSession {
  format: SafeRemainderImportFormat;
  fileName: string;
  reading: boolean;
  error: string;
  preview: SafeRemainderCsvPreview | null;
  mapping: string[];
  items: TSafeRemainderImportItem[];
  readFile: (file?: File) => Promise<void>;
  changeFormat: (format: string) => void;
  selectColumn: (index: number, key: string) => void;
  resetMapping: () => void;
  clear: () => void;
}

export const useSafeRemainderImport = (
  disabled: boolean,
): SafeRemainderImportSession => {
  const { t } = useTranslation('accounting');
  const requestId = useRef(0);
  const [format, setFormat] = useState<SafeRemainderImportFormat>('csv');
  const [fileName, setFileName] = useState('');
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState('');
  const [preview, setPreview] = useState<SafeRemainderCsvPreview | null>(null);
  const [mapping, setMapping] = useState<string[]>([]);
  const [textItems, setTextItems] = useState<TSafeRemainderImportItem[]>([]);

  const clear = useCallback(() => {
    requestId.current += 1;
    setFileName('');
    setReading(false);
    setReadError('');
    setPreview(null);
    setMapping([]);
    setTextItems([]);
  }, []);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  const result = useMemo(() => {
    try {
      return {
        items: preview ? mapSafeRemainderCsv(preview, mapping) : textItems,
        error: '',
      };
    } catch (error) {
      return {
        items: [],
        error:
          error instanceof Error ? error.message : t('invalid-file-format'),
      };
    }
  }, [preview, mapping, textItems, t]);

  const readFile = async (file?: File): Promise<void> => {
    if (!file || disabled) return;
    clear();
    const id = requestId.current;
    setFileName(file.name);
    setReading(true);
    try {
      if (!file.name.toLowerCase().endsWith(`.${format}`))
        throw new Error(t('invalid-file-format'));
      const text = await file.text();
      if (id !== requestId.current) return;
      if (format === 'csv') {
        const nextPreview = previewSafeRemainderCsv(text);
        if (!nextPreview.headers.length || !nextPreview.rows.length)
          throw new Error(t('no-rows-found-to-import'));
        setPreview(nextPreview);
        setMapping(suggestSafeRemainderCsvMapping(nextPreview.headers));
      } else {
        const items = parseSafeRemainderText(text);
        if (!items.length) throw new Error(t('no-rows-found-to-import'));
        setTextItems(items);
      }
    } catch (error) {
      if (id === requestId.current)
        setReadError(
          error instanceof Error ? error.message : t('invalid-file-format'),
        );
    } finally {
      if (id === requestId.current) setReading(false);
    }
  };

  return {
    format,
    fileName,
    reading,
    preview,
    mapping,
    items: result.items,
    error: readError || result.error,
    readFile,
    clear,
    changeFormat: (value) => {
      if (disabled || (value !== 'csv' && value !== 'txt')) return;
      clear();
      setFormat(value);
    },
    selectColumn: (index, key) => {
      if (!disabled)
        setMapping((current) =>
          current.map((value, column) => (column === index ? key : value)),
        );
    },
    resetMapping: () => {
      if (!disabled && preview)
        setMapping(suggestSafeRemainderCsvMapping(preview.headers));
    },
  };
};
