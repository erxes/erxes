import * as React from 'react';

import { InboxManagementActionConsumer } from '../InboxCore';
import { StatusFilterPopover } from '../../components/leftSidebar';

type Props = {
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
