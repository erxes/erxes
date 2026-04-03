import { Filter } from 'erxes-ui';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogDocIdFilter } from './LogDocIdFilter';
import { LogUsersFilter } from './LogUsersFilter';

export const LogRecordTableFilterViews = () => {
  return (
    <>
      <Filter.View filterKey="status">
        <LogStatusFilter />
      </Filter.View>
      <Filter.View filterKey="source">
        <LogSourceFilter />
      </Filter.View>

      <Filter.View filterKey="action">
        <LogActionsFilter />
      </Filter.View>

      <Filter.View filterKey="userIds">
        <LogUsersFilter />
      </Filter.View>

      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>

      <Filter.View filterKey="contentType">
        <LogContentTypeFilter />
      </Filter.View>

      <Filter.View filterKey="docId">
        <LogDocIdFilter />
      </Filter.View>
    </>
  );
};
