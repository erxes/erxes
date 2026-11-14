import { ReactNode, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import {
  IconChevronLeft,
  IconChevronRight,
  IconFilterOff,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Input,
  Label,
  Sheet,
  Skeleton,
  Table,
  toast,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { FIXED_ASSET_CHOOSER } from '@/settings/fixed-assets/components/chooser/graphql';
import {
  FixedAssetChooserHeader,
  FixedAssetChooserRows,
  FixedAssetChosenRows,
} from '@/settings/fixed-assets/components/chooser/FixedAssetChooserRows';
import { FixedAssetChooserLocationFilter } from '@/settings/fixed-assets/components/chooser/FixedAssetChooserLocationFilter';
import {
  addFxaChoices,
  availableFxaChooserItems,
  sameFxaChoiceLocation,
} from '@/settings/fixed-assets/components/chooser/selection';
import { TrJournalEnum } from '@/transactions/types/constants';
import {
  TFixedAssetChoice,
  fixedAssetChoiceKey,
} from '@/settings/fixed-assets/components/chooser/types';

export interface IFixedAssetChooserProps {
  journal: string;
  date?: Date | string;
  value?: string;
  branchId?: string;
  departmentId?: string;
  ownerId?: string;
  excludeTransactionId?: string;
  allLocations?: boolean;
  multiple?: boolean;
  children?: ReactNode;
  onChoose: (choices: TFixedAssetChoice[]) => void | boolean;
}

export const FixedAssetChooser = (props: IFixedAssetChooserProps) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {props.children || (
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full rounded-none justify-start px-2 font-normal text-left"
            aria-label={t('fxa-chooser-title')}
          >
            <SelectFixedAsset.Provider value={props.value || ''}>
              <SelectFixedAsset.Value />
            </SelectFixedAsset.Provider>
          </Button>
        )}
      </Sheet.Trigger>
      <Sheet.View className="flex flex-col gap-0 p-0 sm:max-w-6xl">
        <Sheet.Header className="h-auto py-2">
          <Sheet.Title>{t('fxa-chooser-title')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {t('fxa-chooser-description')}
          </Sheet.Description>
        </Sheet.Header>
        {open && (
          <FixedAssetChooserBody {...props} onClose={() => setOpen(false)} />
        )}
      </Sheet.View>
    </Sheet>
  );
};

export const FixedAssetChooserBody = ({
  onClose,
  ...props
}: IFixedAssetChooserProps & { onClose: () => void }) => {
  const { t } = useTranslation('accounting');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [branchId, setBranchId] = useState(props.branchId || '');
  const [departmentId, setDepartmentId] = useState(props.departmentId || '');
  const [ownerId, setOwnerId] = useState(props.ownerId || '');
  const [page, setPage] = useState(1);
  const [selections, setSelections] = useState<TFixedAssetChoice[]>([]);
  const [searchValue] = useDebounce(search, 350);
  const validDate =
    props.date && Number.isFinite(new Date(props.date).getTime());
  const { data, loading, error, refetch } = useQuery(FIXED_ASSET_CHOOSER, {
    variables: {
      journal: props.journal,
      date: props.date || new Date(),
      searchValue: searchValue || undefined,
      categoryId: categoryId || undefined,
      branchId: branchId || undefined,
      departmentId: departmentId || undefined,
      ownerId: ownerId || undefined,
      excludeTransactionId: props.excludeTransactionId,
      page,
    },
    skip: !validDate,
    fetchPolicy: 'network-only',
  });
  const result = data?.accountingFixedAssetChooser;
  const assetScoped =
    Boolean(props.allLocations) ||
    props.journal === TrJournalEnum.FXA_REVALUATION;
  const visibleItems = useMemo(
    () =>
      availableFxaChooserItems(result?.items || [], selections, assetScoped),
    [result?.items, selections, assetScoped],
  );
  const hasFilters = Boolean(
    search || categoryId || branchId || departmentId || ownerId,
  );
  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };
  const choose = (choices: TFixedAssetChoice[]) => {
    if (choices.some((choice) => !choice.asset._id)) return;
    const next = addFxaChoices(
      selections,
      choices,
      Boolean(props.multiple),
      assetScoped,
    );
    if (
      next.some(
        (choice) =>
          choice.location &&
          next.filter((other) => sameFxaChoiceLocation(other, choice)).length >
            choice.location.remainder,
      )
    ) {
      toast({ title: t('fxa-chooser-location-limit'), variant: 'destructive' });
      return;
    }
    setSelections(next);
  };
  const remove = (choice: TFixedAssetChoice) =>
    setSelections((previous) =>
      previous.filter(
        (item) => fixedAssetChoiceKey(item) !== fixedAssetChoiceKey(choice),
      ),
    );
  const apply = () => {
    if (props.onChoose(selections) !== false) onClose();
  };
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 flex-none">
        <Input
          className="min-w-56 flex-1"
          value={search}
          onChange={(event) =>
            updateFilter(() => setSearch(event.target.value))
          }
          placeholder={t('fxa-chooser-search')}
          aria-label={t('search-assets')}
          autoFocus
        />
        <div className="w-48">
          <SelectFixedAssetCategory
            selected={categoryId || undefined}
            nullable
            onSelect={(value) => updateFilter(() => setCategoryId(value || ''))}
          />
        </div>
        <div className="w-44">
          <SelectMember
            mode="single"
            value={ownerId}
            onValueChange={(value) =>
              updateFilter(() =>
                setOwnerId(Array.isArray(value) ? value[0] || '' : value || ''),
              )
            }
            placeholder={t('asset-custodian')}
          />
        </div>
        <div className="w-44">
          <FixedAssetChooserLocationFilter
            kind="branch"
            value={branchId}
            onValueChange={(value) => updateFilter(() => setBranchId(value))}
          />
        </div>
        <div className="w-44">
          <FixedAssetChooserLocationFilter
            kind="department"
            value={departmentId}
            onValueChange={(value) =>
              updateFilter(() => setDepartmentId(value))
            }
          />
        </div>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              updateFilter(() => {
                setSearch('');
                setCategoryId('');
                setBranchId('');
                setDepartmentId('');
                setOwnerId('');
              })
            }
          >
            <IconFilterOff />
            {t('clear-filters')}
          </Button>
        )}
      </div>
      <Sheet.Content className="flex min-h-0 flex-col overflow-hidden border-b-0">
        <p className="flex items-center gap-1.5 px-4 pt-3 pb-2 text-xs text-muted-foreground">
          <IconInfoCircle className="size-3.5 shrink-0" />
          {t(
            props.allLocations
              ? 'fxa-chooser-all-locations-help'
              : 'fxa-chooser-description',
          )}
        </p>
        {!validDate && (
          <p role="alert" className="px-4 pb-2 text-sm text-destructive">
            {t('fxa-chooser-date-required')}
          </p>
        )}
        <div className="mx-4 min-h-0 flex-1 overflow-auto rounded-lg border">
          <Table className="table-fixed min-w-[1000px]">
            <FixedAssetChooserHeader />
            <Table.Body>
              {!loading &&
                !error &&
                visibleItems.map((item) => (
                  <FixedAssetChooserRows
                    key={item.asset._id}
                    item={item}
                    allLocations={Boolean(props.allLocations)}
                    assetScoped={assetScoped}
                    selections={selections}
                    choose={choose}
                  />
                ))}
            </Table.Body>
          </Table>
          {loading && (
            <div className="p-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {!loading && (error || !visibleItems.length) && validDate && (
            <AccountingEmptyState
              error={error}
              description={t(
                result?.items.length
                  ? 'fxa-chooser-no-available'
                  : 'empty-filter-description',
              )}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => refetch()}
                >
                  {t('retry')}
                </Button>
              }
            />
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {t('results-count', { count: result?.totalCount || 0 })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('previous-page', { defaultValue: 'Өмнөх' })}
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <IconChevronLeft />
            </Button>
            <span className="min-w-6 text-center text-sm tabular-nums">
              {page}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('next')}
              disabled={loading || !result?.hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              <IconChevronRight />
            </Button>
          </div>
        </div>
      </Sheet.Content>
      {selections.length > 0 && (
        <section
          className="flex-none space-y-2 border-t bg-background px-4 py-3"
          aria-label={t('fxa-chooser-selected')}
        >
          <div className="flex items-center gap-2">
            <Label>{t('fxa-chooser-selected')}</Label>
            <Badge variant="secondary">{selections.length}</Badge>
          </div>
          <div className="max-h-48 overflow-auto rounded-lg border">
            <Table className="table-fixed min-w-[1000px]">
              <FixedAssetChooserHeader />
              <Table.Body>
                <FixedAssetChosenRows choices={selections} remove={remove} />
              </Table.Body>
            </Table>
          </div>
        </section>
      )}
      <Sheet.Footer className="border-t p-4 gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="button"
          disabled={!selections.length || loading || Boolean(error)}
          onClick={apply}
        >
          {t('fxa-chooser-apply', { count: selections.length })}
        </Button>
      </Sheet.Footer>
    </>
  );
};
