import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AMENITIES_CURSOR_SESSION_KEY } from '../constants/amenityCursorSessionKey';
import { AmenityTotalCount } from './AmenityTotalCount';

const AmenityFilterPopover = () => {
  const { t } = useTranslation('tourism');
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
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

export const AmenityFilter = () => {
  return (
    <Filter id="amenities-filter" sessionKey={AMENITIES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <AmenityFilterPopover />
        <Filter.SearchValueBarItem />
        <AmenityTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
