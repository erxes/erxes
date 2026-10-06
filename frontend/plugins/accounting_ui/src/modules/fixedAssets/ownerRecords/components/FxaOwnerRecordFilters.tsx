import { useTranslation } from 'react-i18next';
import { IconCalendar, IconSearch, IconToggleRight } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Filter,
  Popover,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { SelectMember } from 'ui-modules';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';

const OWNER_RECORD_STATUSES = [
  { value: 'active', label: 'navigation.active' },
  { value: 'inactive', label: 'inactive' },
];

const OWNER_RECORD_ACTIONS = [
  { value: 'received', label: 'received' },
  { value: 'handedOver', label: 'handed-over' },
];

const FxaOwnerRecordStatusFilter = () => {
  const { t } = useTranslation('accounting');

  const [status, setStatus] = useQueryState<string>('status');
  const [open, setOpen] = useState(false);
  const selectedStatus = OWNER_RECORD_STATUSES.find(
    (item) => item.value === status,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="h-8">
          <IconToggleRight />
          {t(selectedStatus?.label ?? '') || t('status')}
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Item
              value="all"
              onSelect={() => {
                setStatus(null);
                setOpen(false);
              }}
            >
              {t('global-search.all')}
            </Command.Item>
            {OWNER_RECORD_STATUSES.map((item) => (
              <Command.Item
                key={item.value}
                value={item.value}
                onSelect={() => {
                  setStatus(item.value);
                  setOpen(false);
                }}
              >
                {t(item.label)}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const FxaOwnerRecordAssetFilter = () => {
  const { t } = useTranslation('accounting');

  const [fixedAssetId, setFixedAssetId] = useQueryState<string>('fixedAssetId');

  return (
    <div className="w-64">
      <SelectFixedAsset
        mode="single"
        value={fixedAssetId || ''}
        onValueChange={(value) =>
          setFixedAssetId(
            Array.isArray(value) ? value[0] || null : value || null,
          )
        }
        placeholder={t('fixed-asset')}
        className="h-8"
      />
    </div>
  );
};

const FxaOwnerRecordCategoryFilter = () => {
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  return (
    <div className="w-56">
      <SelectFixedAssetCategory
        selected={categoryId || undefined}
        onSelect={(value) => setCategoryId(value || null)}
        nullable
        className="h-8"
      />
    </div>
  );
};

const FxaOwnerRecordMemberFilter = () => {
  const { t } = useTranslation('accounting');

  const [ownerId, setOwnerId] = useQueryState<string>('ownerId');

  return (
    <div className="w-56">
      <SelectMember
        mode="single"
        value={ownerId || ''}
        onValueChange={(value) =>
          setOwnerId(Array.isArray(value) ? value[0] || null : value || null)
        }
        placeholder={t('asset-custodian')}
        className="h-8"
      />
    </div>
  );
};

const FxaOwnerRecordActionFilter = () => {
  const { t } = useTranslation('accounting');

  const [action, setAction] = useQueryState<string>('action');
  const [open, setOpen] = useState(false);
  const selectedAction = OWNER_RECORD_ACTIONS.find(
    (item) => item.value === action,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="h-8">
          <IconToggleRight />
          {t(selectedAction?.label ?? '') || t('direction')}
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Item
              value="all"
              onSelect={() => {
                setAction(null);
                setOpen(false);
              }}
            >
              {t('global-search.all')}
            </Command.Item>
            {OWNER_RECORD_ACTIONS.map((item) => (
              <Command.Item
                key={item.value}
                value={item.value}
                onSelect={() => {
                  setAction(item.value);
                  setOpen(false);
                }}
              >
                {t(item.label)}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const FxaOwnerRecordFilterPopover = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Popover scope="fxa-owner-records-filter">
      <Filter.Trigger isFiltered={false} />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filters')}
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="p-1">
              <Filter.Item value="searchValue" inDialog>
                <IconSearch />
                {t('search')}
              </Filter.Item>
              <Filter.Item value="createdDate" inDialog>
                <IconCalendar />
                {t('date')}
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const FxaOwnerRecordFilters = () => {
  const { t } = useTranslation('accounting');

  const [searchValue] = useQueryState<string>('searchValue');

  return (
    <Filter id="fxa-owner-records-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <FxaOwnerRecordAssetFilter />
        <FxaOwnerRecordCategoryFilter />
        <FxaOwnerRecordMemberFilter />
        <FxaOwnerRecordActionFilter />
        <FxaOwnerRecordStatusFilter />
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendar />
            {t('date')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDate" />
        </Filter.BarItem>
        <FxaOwnerRecordFilterPopover />
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="createdDate" inDialog>
          <Filter.DialogDateView filterKey="createdDate" />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
