import { Combobox, Command, Filter, useFilterContext, useMultiQueryState, useQueryState } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import {
  PRIMARY_FILTER_FIELDS,
  SYNC_HISTORY_FILTER_KEYS,
  SyncHistoryFilterField,
  SyncHistoryFilterValues,
  TEXT_FILTER_FIELDS,
} from './MSDynamicSyncHistoryFilterFields';

const SyncHistoryFilterItem = ({
  field,
  inDialog,
}: {
  field: SyncHistoryFilterField;
  inDialog?: boolean;
}) => {
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
}: {
  field: SyncHistoryFilterField;
}) => {
  return (
    <Filter.View filterKey={field.key} inDialog>
      <Filter.DialogStringView filterKey={field.key} />
    </Filter.View>
  );
};

export const MSDynamicSyncHistoryFilterPopover = () => {
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<SyncHistoryFilterValues>(
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
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                {PRIMARY_FILTER_FIELDS.map((field) => (
                  <SyncHistoryFilterItem key={field.key} field={field} />
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
        {TEXT_FILTER_FIELDS.map((field) => (
          <SyncHistoryTextDialogView key={field.key} field={field} />
        ))}
      </Filter.Dialog>
    </>
  );
};
