import { Combobox, Command, Filter } from 'erxes-ui';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { ItineraryTotalCount } from './ItineraryTotalCount';

const ItineraryFilterPopover = () => {
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />
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

export const ItineraryFilter = () => {
  return (
    <Filter id="itineraries-filter" sessionKey={ITINERARIES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ItineraryFilterPopover />
        <Filter.SearchValueBarItem />
        <ItineraryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
