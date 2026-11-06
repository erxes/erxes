import { ReactNode, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label, Sheet, Skeleton, Table, toast } from 'erxes-ui';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { FIXED_ASSET_CHOOSER } from '@/settings/fixed-assets/components/chooser/graphql';
import {
  FixedAssetChooserHeader,
  FixedAssetChooserRows,
  FixedAssetChosenRows,
} from '@/settings/fixed-assets/components/chooser/FixedAssetChooserRows';
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
    Boolean(props.allLocations) || props.journal === TrJournalEnum.FXA_JUSTIFY;
  const visibleItems = useMemo(
    () =>
      availableFxaChooserItems(result?.items || [], selections, assetScoped),
    [result?.items, selections, assetScoped],
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
      <Sheet.Content className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label>{t('search-assets')}</Label>
            <Input
              value={search}
              onChange={(event) =>
                updateFilter(() => setSearch(event.target.value))
              }
              placeholder={t('fxa-chooser-search')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('category')}</Label>
            <SelectFixedAssetCategory
              selected={categoryId || undefined}
              nullable
              onSelect={(value) =>
                updateFilter(() => setCategoryId(value || ''))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>{t('asset-custodian')}</Label>
            <SelectMember
              mode="single"
              value={ownerId}
              onValueChange={(value) =>
                updateFilter(() =>
                  setOwnerId(
                    Array.isArray(value) ? value[0] || '' : value || '',
                  ),
                )
              }
              placeholder={t('asset-custodian')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('branch')}</Label>
            <SelectBranches.Root
              mode="single"
              value={branchId === '_' ? '' : branchId}
              onValueChange={(value) =>
                updateFilter(() =>
                  setBranchId(
                    Array.isArray(value) ? value[0] || '' : value || '',
                  ),
                )
              }
              placeholder={t('branch')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                updateFilter(() => setBranchId(branchId === '_' ? '' : '_'))
              }
            >
              {branchId === '_' ? '✓ ' : ''}
              {t('fxa-chooser-unassigned-branch')}
            </Button>
          </div>
          <div className="space-y-1">
            <Label>{t('department')}</Label>
            <SelectDepartments.Root
              mode="single"
              value={departmentId === '_' ? '' : departmentId}
              onValueChange={(value) =>
                updateFilter(() =>
                  setDepartmentId(
                    Array.isArray(value) ? value[0] || '' : value || '',
                  ),
                )
              }
              placeholder={t('department')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                updateFilter(() =>
                  setDepartmentId(departmentId === '_' ? '' : '_'),
                )
              }
            >
              {departmentId === '_' ? '✓ ' : ''}
              {t('fxa-chooser-unassigned-department')}
            </Button>
          </div>
          <div className="flex items-end pb-1">
            <Button
              type="button"
              variant="secondary"
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
              {t('clear-filters')}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t(
            props.allLocations
              ? 'fxa-chooser-all-locations-help'
              : 'fxa-chooser-description',
          )}
        </p>
        {!validDate && (
          <p role="alert" className="text-destructive">
            {t('fxa-chooser-date-required')}
          </p>
        )}
        <div className="overflow-x-auto border rounded">
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
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
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {t('results-count', { count: result?.totalCount || 0 })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              {t('previous')}
            </Button>
            <span className="self-center text-sm">{page}</span>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || !result?.hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      </Sheet.Content>
      {selections.length > 0 && (
        <section
          className="border-t bg-background shrink-0"
          aria-label={t('fxa-chooser-selected')}
        >
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Label>{t('fxa-chooser-selected')}</Label>
            <span className="text-xs text-muted-foreground">
              {selections.length}
            </span>
          </div>
          <div className="max-h-56 overflow-auto">
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
