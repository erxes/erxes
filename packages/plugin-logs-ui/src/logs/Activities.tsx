import * as React from 'react';

import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';

type Props = {
  contact: any;
};

class Activities extends React.Component<Props> {
  render() {
    const { contact } = this.props;

    return (
      <>
        <ActivityInputs
          contentTypeId={contact._id}
          contentType="core:user"
          showEmail={false}
        />

        <ActivityLogs
          target={contact.details && contact.details.fullName}
          contentId={contact._id}
          contentType="core:user"
          extraTabs={[{ name: 'conversation', label: 'Conversations' }]}
        />
      </>
    );
  }
}

export default Activities;
