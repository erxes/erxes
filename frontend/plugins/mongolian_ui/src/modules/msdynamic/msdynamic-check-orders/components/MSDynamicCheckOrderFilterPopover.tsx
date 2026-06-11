import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { SelectBrand, SelectMember } from 'ui-modules';
import {
  CHECK_ORDER_FILTER_KEYS,
  ICheckOrderFilterValues,
  PRIMARY_FILTER_FIELDS,
  type ICheckOrderFilterField,
} from './MSDynamicCheckOrderFilterFields';

interface ICheckOrderFilterItemProps {
  field: ICheckOrderFilterField;
  inDialog?: boolean;
}

const CheckOrderFilterItem = ({
  field,
  inDialog,
}: ICheckOrderFilterItemProps) => {
  const { Icon, key, label } = field;

  return (
    <Filter.Item value={key} inDialog={inDialog}>
      <Icon />
      {label}
    </Filter.Item>
  );
};

export const MSDynamicCheckOrderFilterPopover = () => {
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<ICheckOrderFilterValues>(
    CHECK_ORDER_FILTER_KEYS,
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
                  <CheckOrderFilterItem
                    key={field.key}
                    field={field}
                    inDialog={field.key === 'number'}
                  />
                ))}
              </Command.List>
            </Command>
          </Filter.View>
          <SelectBrand.FilterView queryKey="brandId" />
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
          <Filter.View filterKey="paidDateRange">
            <Filter.DateView filterKey="paidDateRange" />
          </Filter.View>
          <Filter.View filterKey="createdAtRange">
            <Filter.DateView filterKey="createdAtRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="paidDateRange" inDialog>
          <Filter.DialogDateView filterKey="paidDateRange" />
        </Filter.View>
        <Filter.View filterKey="createdAtRange" inDialog>
          <Filter.DialogDateView filterKey="createdAtRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
