import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface GenericFilterProps {
  id: string;
  sessionKey: string;
}

export const GenericFilter = ({ id, sessionKey }: GenericFilterProps) => {
  return (
    <Filter id={id} sessionKey={sessionKey}>
      <Filter.Bar>
        <GenericFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const GenericFilterPopover = () => {
  const { t } = useTranslation('insurance');
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
