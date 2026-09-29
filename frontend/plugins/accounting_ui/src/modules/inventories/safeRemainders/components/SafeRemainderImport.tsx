import { IconFileImport } from '@tabler/icons-react';
import { Button, Label, Sheet, Tabs, toast } from 'erxes-ui';
import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useSafeRemainderItemsBulkEdit } from '../hooks/useSafeRemainderItemsBulkEdit';
import { TSafeRemainderImportItem } from '../types/SafeRemainder';
import { parseSafeRemainderImport } from '../utils/parseSafeRemainderImport';

type DuplicateRule = 'last' | 'skip' | 'add';
type ImportFormat = 'txt' | 'csv';

const DUPLICATE_RULES: {
  value: DuplicateRule;
  label: string;
  description: string;
}[] = [
  {
    value: 'last',
    label: 'last',
    description: 'Давтагдсан бол сүүлийн утгыг авна',
  },
  {
    value: 'skip',
    label: 'skip',
    description: 'Давтагдсан бол анхны утгыг хадгална',
  },
  {
    value: 'add',
    label: 'add',
    description: 'Давтагдсан бол утгуудыг нэмнэ',
  },
];

const DuplicateRuleOptions = ({
  value,
  onChange,
}: {
  value: DuplicateRule;
  onChange: (rule: DuplicateRule) => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="flex flex-col gap-3">
      {DUPLICATE_RULES.map((rule) => (
        <Label
          key={rule.value}
          className="flex items-start gap-3 cursor-pointer rounded-md border p-3 hover:bg-accent"
        >
          <input
            type="radio"
            name="duplicateRule"
            value={rule.value}
            checked={value === rule.value}
            onChange={() => onChange(rule.value)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">{t(rule.label)}</p>
            <p className="text-xs text-muted-foreground">{rule.description}</p>
          </div>
        </Label>
      ))}
    </div>
  );
};

export const SafeRemainderImport = ({
  safeRemainderId,
}: {
  safeRemainderId: string;
}) => {
  const { t } = useTranslation('accounting');
  const txtInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<ImportFormat>('txt');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>('last');
  const [pendingItems, setPendingItems] = useState<
    TSafeRemainderImportItem[]
  >([]);
  const { bulkEditRemItems, loading } = useSafeRemainderItemsBulkEdit();

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (typeof target?.result !== 'string') return;

      try {
        const items = parseSafeRemainderImport(target.result, file.name);
        if (!items.length) throw new Error('Импортлох мөр олдсонгүй');
        setPendingItems(items);
        setSelectedFileName(file.name);
      } catch (error) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : 'Файлын формат буруу байна',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirm = async () => {
    await bulkEditRemItems(safeRemainderId, pendingItems, duplicateRule);
    setOpen(false);
    setPendingItems([]);
    setSelectedFileName('');
  };

  const handleFormatChange = (value: string) => {
    setImportFormat(value === 'csv' ? 'csv' : 'txt');
    setPendingItems([]);
    setSelectedFileName('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPendingItems([]);
      setSelectedFileName('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="secondary"
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        <IconFileImport />
        {t('import')}
      </Button>
      <AccountingSheet title={t('import-from-file')}>
        <div className="flex flex-col flex-1 min-h-0 bg-background">
          <div className="flex-1 space-y-4 p-5">
            <Tabs value={importFormat} onValueChange={handleFormatChange}>
              <Tabs.List className="w-full">
                <Tabs.Trigger value="txt" className="flex-1">
                  TXT
                </Tabs.Trigger>
                <Tabs.Trigger value="csv" className="flex-1">
                  CSV
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="txt" className="space-y-4 pt-4">
                <input
                  ref={txtInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={handleFile}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">TXT файлын формат</p>
                  <p className="text-sm text-muted-foreground">
                    Header-гүй code,count мөрүүд. Бүртгэлийн нийт өртгийг
                    системээс авна.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={loading}
                  onClick={() => txtInputRef.current?.click()}
                >
                  <IconFileImport />
                  TXT импортлох
                </Button>
              </Tabs.Content>
              <Tabs.Content value="csv" className="space-y-4 pt-4">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFile}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">CSV файлын формат</p>
                  <p className="text-sm text-muted-foreground">
                    productCode,count,totalCost,isSale,unitPrice. totalCost нь
                    тооллогын нийт өртөг бөгөөд хоосон бол одоогийн нэгжийн
                    өртгөөр автоматаар бодно; unitCost болон trInfo.unitCost
                    нэрийг мөн дэмжинэ.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={loading}
                  onClick={() => csvInputRef.current?.click()}
                >
                  <IconFileImport />
                  CSV импортлох
                </Button>
              </Tabs.Content>
            </Tabs>

            {pendingItems.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">
                  {selectedFileName} ({pendingItems.length} мөр)
                </p>
                <p className="text-sm text-muted-foreground">
                  Давтагдсан productCode-тэй мөрүүдийг хэрхэн боловсруулах вэ?
                </p>
                <DuplicateRuleOptions
                  value={duplicateRule}
                  onChange={setDuplicateRule}
                />
              </div>
            )}
          </div>
          <Sheet.Footer className="px-5 border-t bg-background shrink-0 mt-4">
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || pendingItems.length === 0}
            >
              Импортлох ({pendingItems.length} мөр)
            </Button>
          </Sheet.Footer>
        </div>
      </AccountingSheet>
    </Sheet>
  );
};
