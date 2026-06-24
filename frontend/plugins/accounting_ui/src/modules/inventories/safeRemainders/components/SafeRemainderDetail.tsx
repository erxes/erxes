import {
  IconAccessPoint,
  IconCrane,
  IconTrashX,
  IconFileImport,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Button,
  cn,
  Dialog,
  Label,
  RecordTable,
  Spinner,
  Tabs,
  useQueryState,
  RecordTableHotkeyProvider,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AccountingDialog } from '@/layout/components/Dialog';
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
      <div className="m-3 mb-0">
        <h3 className="text-lg font-bold">{t('inventory-census-detail')}</h3>
        <div className="flex items-center col-span-2 xl:col-span-3 gap-6">
          <div>
            {safeRemainder && <StatusBar safeRemainder={safeRemainder} />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">{t('status')}:</span>
            <span className="text-primary font-bold">
              {safeRemainder?.status}
            </span>
          </div>
          {renderEvents()}
        </div>
      </div>
      <div className="">
        <SafeRemainderDetailFilter />
      </div>
      <Tabs
        className="col-span-2 flex flex-1 flex-col min-h-0"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex items-center gap-3">
          <Tabs.List className="w-full justify-start flex-auto">
            {Object.values(CENSUS_TABS).map((field) => (
              <Tabs.Trigger
                key={field.value}
                value={field.value}
                className={cn(
                  field.value === activeTab && 'font-bold',
                  'capitalize py-1 gap-2 pr-1 h-8',
                )}
                asChild
              >
                <div>{field.label}</div>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
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
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('date')}:</Label>
        <span>{dayjs(safeRemainder.date).format('YYYY-MM-DD HH:mm:ss')}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('branch')}:</Label>
        <span>{`${safeRemainder.branch?.code ?? ''} - ${
          safeRemainder.branch?.title ?? ''
        }`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('department')}:</Label>
        <span>{`${safeRemainder.department?.code ?? ''} - ${
          safeRemainder.department?.title ?? ''
        }`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      {safeRemainder.productCategoryId && (
        <div className="flex items-center gap-2 text-sm">
          <Label>{t('product-category')}:</Label>
          <span>{`${safeRemainder.productCategory?.code ?? ''} - ${
            safeRemainder.productCategory?.name ?? ''
          }`}</span>
          <span className="text-accent-foreground">{'|'}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('description')}:</Label>
        <span>{safeRemainder.description}</span>
      </div>
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
    <Dialog open={open} onOpenChange={setOpen}>
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
      <AccountingDialog
        title={t('import-from-file')}
        description={t('choose-duplicate-rule')}
      >
        <div className="p-4 flex flex-col gap-4">
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
          <div className="flex justify-end gap-2 mt-2">
            <Dialog.Close asChild>
              <Button variant="secondary">Цуцлах</Button>
            </Dialog.Close>
            <Button onClick={handleConfirm} disabled={loading}>
              Импортлох ({pendingItems.length} мөр)
            </Button>
          </div>
        </div>
      </AccountingDialog>
    </Dialog>
  );
};
