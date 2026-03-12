import { Filter } from 'erxes-ui';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';

const ItineraryFilterPopover = () => {
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
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
      </Filter.Bar>
    </Filter>
  );
};
