import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import {
  type ISyncHistoryFilterField,
  type ISyncHistoryFilterValues,
  PRIMARY_FILTER_FIELDS,
  SYNC_HISTORY_FILTER_KEYS,
  TEXT_FILTER_FIELDS,
} from './MSDynamicSyncHistoryFilterFields';

interface ISyncHistoryFilterItemProps {
  field: ISyncHistoryFilterField;
  inDialog?: boolean;
}

interface ISyncHistoryTextDialogViewProps {
  field: ISyncHistoryFilterField;
}

const SyncHistoryFilterItem = ({
  field,
  inDialog,
}: ISyncHistoryFilterItemProps) => {
  const { Icon, key, label } = field;

  return (
    <Filter.Item value={key} inDialog={inDialog}>
      <Icon />
      {label}
    </Filter.Item>
  );
};

const SyncHistoryTextDialogView = ({
  field,
}: ISyncHistoryTextDialogViewProps) => {
  return (
    <Filter.View filterKey={field.key} inDialog>
      <Filter.DialogStringView filterKey={field.key} />
    </Filter.View>
  );
};

export const MSDynamicSyncHistoryFilterPopover = () => {
  const { t } = useTranslation('mongolian');
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<ISyncHistoryFilterValues>(
    SYNC_HISTORY_FILTER_KEYS,
  );
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                {PRIMARY_FILTER_FIELDS.map((field) => (
                  <SyncHistoryFilterItem
                    key={field.key}
                    field={field}
                    inDialog={
                      field.key === 'contentType' || field.key === 'contentId'
                    }
                  />
                ))}
                <Command.Separator className="my-1" />
                {TEXT_FILTER_FIELDS.map((field) => (
                  <SyncHistoryFilterItem
                    key={field.key}
                    field={field}
                    inDialog
                  />
                ))}
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
          <Filter.View filterKey="user">
            <SelectMember.Provider
              mode="single"
              value={user || ''}
              onValueChange={(value) => {
                setUser(String(value || ''));
                resetFilterState();
              }}
            >
              <SelectMember.Content />
            </SelectMember.Provider>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>

        <Filter.View filterKey="contentType" inDialog>
          <Filter.DialogStringView filterKey="contentType" />
        </Filter.View>

        <Filter.View filterKey="contentId" inDialog>
          <Filter.DialogStringView filterKey="contentId" />
        </Filter.View>

        {TEXT_FILTER_FIELDS.map((field) => (
          <SyncHistoryTextDialogView key={field.key} field={field} />
        ))}
      </Filter.Dialog>
    </>
  );
};
