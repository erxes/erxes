import {
  IconAccessPoint,
  IconCrane,
  IconTrashX,
  IconFileImport,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Button,
  Label,
  PageSubHeader,
  RecordTable,
  Sheet,
  Spinner,
  Tabs,
  ToggleGroup,
  useQueryState,
  RecordTableHotkeyProvider,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';
import {
  useSafeRemainderCancel,
  useSafeRemainderDoTr,
  useSafeRemainderReCalc,
  useSafeRemainderSubmit,
  useSafeRemainderUndoTr,
} from '../hooks/useSafeRemainderChange';
import {
  ISafeRemainder,
  SAFE_REMAINDER_STATUSES,
} from '../types/SafeRemainder';
import { safeRemDetailTableColumns } from './SafeRemainderDetailColumns';
import { SafeRemDetailCommandbar } from './SafeRemainderDetailCommandbar';
import { SafeRemainderDetailFilter } from './SafeRemainderDetailFilters';
import { activeTabState } from '../states';
import { useAtom } from 'jotai';
import { CENSUS_TABS } from '../types/constants';
import { safeRemDetailColumnsIncome } from './SafeRemainderDetailColsIncome';
import { safeRemDetailColumnsOut } from './SafeRemainderDetailColsOut';
import { safeRemDetailColumnsSale } from './SafeRemainderDetailColsSale';
import { EditSafeRemainder } from './SafeRemainderEditForm';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { useRef, useState } from 'react';
import { useSafeRemainderItemsBulkEdit } from '../hooks/useSafeRemainderItemsBulkEdit';
import { useTranslation } from 'react-i18next';
import { AccountingHeader } from '~/modules/layout/components/Header';

export const SafeRemainderDetail = () => {
  const { t } = useTranslation('accounting');
  const [id] = useQueryState<string>('id');
  const [activeTab, setActiveTab] = useAtom(activeTabState);
  const setHotkeyScope = useSetHotkeyScope();
  const { safeRemainder, loading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });

  const {
    safeRemainderItems,
    safeRemainderItemsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useSafeRemainderDetails({
    variables: { remainderId: id },
    skip: !id,
  });

  const { reCalcSafeRemainder } = useSafeRemainderReCalc();
  const { submitSafeRemainder } = useSafeRemainderSubmit();
  const { cancelSafeRemainder } = useSafeRemainderCancel();
  const { doTrSafeRemainder } = useSafeRemainderDoTr();
  const { undoTrSafeRemainder } = useSafeRemainderUndoTr();
  const { removeSafeRemainder } = useSafeRemainderRemove();

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const renderEvents = () => {
    const status = safeRemainder?.status || SAFE_REMAINDER_STATUSES.DRAFT;
    switch (status) {
      case SAFE_REMAINDER_STATUSES.DRAFT:
        return (
          <>
            <ImportFromFileButton safeRemainderId={id} />
            <Button onClick={() => reCalcSafeRemainder(id)}>
              <IconCrane />
              {t('recalc')}
            </Button>
            <Button onClick={() => submitSafeRemainder(id)}>
              <IconAccessPoint />
              {t('submit')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => removeSafeRemainder({ variables: { _id: id } })}
            >
              <IconTrashX />
              {t('delete')}
            </Button>
          </>
        );
      case SAFE_REMAINDER_STATUSES.DONE:
        return (
          <>
            <Button onClick={() => doTrSafeRemainder(id)}>
              <IconCrane />
              {t('do-transaction')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => cancelSafeRemainder(id)}
            >
              <IconTrashX />
              {t('cancel-submition')}
            </Button>
          </>
        );

      case SAFE_REMAINDER_STATUSES.PUBLISHED:
        return (
          <>
            <Button onClick={() => doTrSafeRemainder(id)}>
              <IconCrane />
              {t('redo-transaction')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => undoTrSafeRemainder(id)}
            >
              <IconTrashX />
              {t('undo-transaction')}
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AccountingHeader
        returnLink="/accounting/inventories/safe-remainders"
        returnText="Safe Remainders"
        skipSettings={true}
        leftChildren={
          <span className="font-semibold">{t('inventory-census-detail')}</span>
        }
      >
        <div className="flex items-center gap-2 text-sm mr-1">
          <span className="text-accent-foreground">{t('status')}:</span>
          <span className="text-primary font-bold capitalize">
            {safeRemainder?.status}
          </span>
        </div>
        {renderEvents()}
      </AccountingHeader>

      {safeRemainder && (
        <div className="flex-none border-b px-3 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
          <StatusBar safeRemainder={safeRemainder} />
        </div>
      )}

      <PageSubHeader className="items-center">
        <SafeRemainderDetailFilter
          afterBar={
            <span className="text-sm text-muted-foreground">
              {safeRemainderItemsCount ?? 0}{' '}
              {t('records-found', 'records found')}
            </span>
          }
        />
      </PageSubHeader>

      <Tabs
        className="col-span-2 flex flex-1 flex-col min-h-0"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex items-center gap-3 px-3 pt-3">
          <ToggleGroup
            type="single"
            value={activeTab}
            onValueChange={(value) => value && setActiveTab(value)}
            variant="outline"
            className="h-8"
          >
            {Object.values(CENSUS_TABS).map((field) => (
              <ToggleGroup.Item
                key={field.value}
                value={field.value}
                className="capitalize"
              >
                {field.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>

        <Tabs.Content
          value={CENSUS_TABS.CENSUS.value}
          className="mt-6 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
        >
          <RecordTableHotkeyProvider
            columnLength={3}
            rowLength={safeRemainderItems?.length || 0}
            scope={AccountingHotkeyScope.SafeRemainderPage}
          >
            <RecordTable.Provider
              columns={safeRemDetailTableColumns}
              data={safeRemainderItems || []}
              stickyColumns={[]}
              className="m-3"
              onClickCapture={() =>
                setHotkeyScope(AccountingHotkeyScope.SafeRemainderPage)
              }
            >
              <RecordTable.Scroll>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                    {!detailsLoading &&
                      safeRemainderItemsCount > safeRemainderItems?.length && (
                        <RecordTable.RowSkeleton
                          rows={4}
                          handleInView={handleFetchMore}
                        />
                      )}
                  </RecordTable.Body>
                </RecordTable>
                <SafeRemDetailCommandbar />
              </RecordTable.Scroll>
            </RecordTable.Provider>
          </RecordTableHotkeyProvider>
        </Tabs.Content>

        <Tabs.Content
          key={CENSUS_TABS.INCOME.value}
          value={CENSUS_TABS.INCOME.value}
          className="mt-6 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
        >
          <RecordTableHotkeyProvider
            columnLength={4}
            rowLength={safeRemainderItems?.length || 0}
            scope={AccountingHotkeyScope.SafeRemainderPage}
          >
            <RecordTable.Provider
              columns={safeRemDetailColumnsIncome}
              data={
                safeRemainderItems?.filter(
                  (item) => item.preCount < item.count,
                ) || []
              }
              stickyColumns={[]}
              className="m-3"
            >
              <RecordTable.Scroll>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                    {!detailsLoading &&
                      safeRemainderItemsCount > safeRemainderItems?.length && (
                        <RecordTable.RowSkeleton
                          rows={4}
                          handleInView={handleFetchMore}
                        />
                      )}
                  </RecordTable.Body>
                </RecordTable>
                <SafeRemDetailCommandbar />
              </RecordTable.Scroll>
            </RecordTable.Provider>
          </RecordTableHotkeyProvider>
        </Tabs.Content>

        <Tabs.Content
          key={CENSUS_TABS.OUT.value}
          value={CENSUS_TABS.OUT.value}
          className="mt-6 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
        >
          <RecordTableHotkeyProvider
            columnLength={3}
            rowLength={safeRemainderItems?.length || 0}
            scope={AccountingHotkeyScope.SafeRemainderPage}
          >
            <RecordTable.Provider
              columns={safeRemDetailColumnsOut}
              data={
                safeRemainderItems.filter(
                  (item) => item.preCount > item.count && !item.trInfo?.isSale,
                ) || []
              }
              stickyColumns={[]}
              className="m-3"
            >
              <RecordTable.Scroll>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                    {!detailsLoading &&
                      safeRemainderItemsCount > safeRemainderItems?.length && (
                        <RecordTable.RowSkeleton
                          rows={4}
                          handleInView={handleFetchMore}
                        />
                      )}
                  </RecordTable.Body>
                </RecordTable>
                <SafeRemDetailCommandbar />
              </RecordTable.Scroll>
            </RecordTable.Provider>
          </RecordTableHotkeyProvider>
        </Tabs.Content>

        <Tabs.Content
          key={CENSUS_TABS.SALE.value}
          value={CENSUS_TABS.SALE.value}
          className="mt-6 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
        >
          <RecordTableHotkeyProvider
            columnLength={3}
            rowLength={safeRemainderItems?.length || 0}
            scope={AccountingHotkeyScope.SafeRemainderPage}
          >
            <RecordTable.Provider
              columns={safeRemDetailColumnsSale}
              data={
                safeRemainderItems.filter(
                  (item) => item.preCount > item.count && item.trInfo?.isSale,
                ) || []
              }
              stickyColumns={[]}
              className="m-3"
            >
              <RecordTable.Scroll>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                    {!detailsLoading &&
                      safeRemainderItemsCount > safeRemainderItems?.length && (
                        <RecordTable.RowSkeleton
                          rows={4}
                          handleInView={handleFetchMore}
                        />
                      )}
                  </RecordTable.Body>
                </RecordTable>
                <SafeRemDetailCommandbar />
              </RecordTable.Scroll>
            </RecordTable.Provider>
          </RecordTableHotkeyProvider>
        </Tabs.Content>
        <Tabs.Content
          key={CENSUS_TABS.CONFIG.value}
          value={CENSUS_TABS.CONFIG.value}
          className="mt-6"
        >
          <EditSafeRemainder />
        </Tabs.Content>
      </Tabs>
    </>
  );
};

const StatusBar = ({ safeRemainder }: { safeRemainder: ISafeRemainder }) => {
  const { t } = useTranslation('accounting');

  const joinLabel = (code?: string, name?: string) =>
    [code, name].filter(Boolean).join(' - ');

  const items: { label: string; value: string }[] = [
    {
      label: t('date'),
      value: dayjs(safeRemainder.date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      label: t('branch'),
      value: joinLabel(safeRemainder.branch?.code, safeRemainder.branch?.title),
    },
    {
      label: t('department'),
      value: joinLabel(
        safeRemainder.department?.code,
        safeRemainder.department?.title,
      ),
    },
    ...(safeRemainder.productCategoryId
      ? [
          {
            label: t('product-category'),
            value: joinLabel(
              safeRemainder.productCategory?.code,
              safeRemainder.productCategory?.name,
            ),
          },
        ]
      : []),
    { label: t('description'), value: safeRemainder.description || '' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </span>
          <span className="text-sm font-medium text-foreground">
            {item.value || '-'}
          </span>
        </div>
      ))}
    </div>
  );
};

type DuplicateRule = 'last' | 'skip' | 'add';

const ImportFromFileButton = ({
  safeRemainderId,
}: {
  safeRemainderId: string;
}) => {
  const { t } = useTranslation('accounting');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>('last');
  const [pendingItems, setPendingItems] = useState<
    { productCode: string; count: number }[]
  >([]);
  const { bulkEditRemItems, loading } = useSafeRemainderItemsBulkEdit();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const items = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .flatMap((line) => {
          const [code, qty] = line.split(',').map((s) => s.trim());
          const quantity = Number.parseFloat(qty);
          if (!code || Number.isNaN(quantity)) return [];
          return [{ productCode: code, count: quantity }];
        });

      if (items.length > 0) {
        setPendingItems(items);
        setOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirm = () => {
    bulkEditRemItems(safeRemainderId, pendingItems, duplicateRule);
    setOpen(false);
    setPendingItems([]);
  };

  const rules: { value: DuplicateRule; label: string; description: string }[] =
    [
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="secondary"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        <IconFileImport />
        {t('import')}
      </Button>
      <AccountingSheet title={t('import-from-file')}>
        <div className="flex flex-col flex-1 min-h-0 bg-background">
          <div className="flex-1 space-y-4 p-5">
            <p className="text-sm text-muted-foreground">
              Давтагдсан productCode-тэй мөрүүдийг хэрхэн боловсруулах вэ?
            </p>
            <div className="flex flex-col gap-3">
              {rules.map((rule) => (
                <Label
                  key={rule.value}
                  className="flex items-start gap-3 cursor-pointer rounded-md border p-3 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="duplicateRule"
                    value={rule.value}
                    checked={duplicateRule === rule.value}
                    onChange={() => setDuplicateRule(rule.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{t(rule.label)}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </Label>
              ))}
            </div>
          </div>
          <Sheet.Footer className="px-5 border-t bg-background shrink-0 mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              Импортлох ({pendingItems.length} мөр)
            </Button>
          </Sheet.Footer>
        </div>
      </AccountingSheet>
    </Sheet>
  );
};
