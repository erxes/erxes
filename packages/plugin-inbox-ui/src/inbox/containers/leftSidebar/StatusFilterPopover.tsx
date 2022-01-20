import * as React from 'react';
import { StatusFilterPopover } from '../../components/leftSidebar';
import { InboxManagementActionConsumer } from '../InboxCore';

type Props = {
  history: any;
  queryParams: any;
};

const StatusFilterPopoverContainer = (props: Props) => {
  return (
    <InboxManagementActionConsumer>
      {({ refetchRequired }) => (
        <StatusFilterPopover {...props} refetchRequired={refetchRequired} />
      )}
    </InboxManagementActionConsumer>
  );
};

export default StatusFilterPopoverContainer;
