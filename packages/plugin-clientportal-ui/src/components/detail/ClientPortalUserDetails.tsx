import {
  __,
  ActivityInputs,
  ActivityLogsContainer as ActivityLogs,
  Wrapper
} from '@erxes/ui/src';
import React from 'react';
import { IClientPortalUser } from '../../types';
import LeftSidebar from './LeftSidebar';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  clientPortalUser: IClientPortalUser;
  currentUser: IUser;
};

class ClientPortalUserDetails extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    const title = clientPortalUser.firstName || 'Unknown';

    const breadcrumb = [
      { title: __('ClientPortal Users'), link: '/settings/client-portal/user' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={clientPortalUser._id}
          contentType="clientPortalUser"
          showEmail={false}
        />
        <ActivityLogs
          target={clientPortalUser.firstName || ''}
          contentId={clientPortalUser._id}
          contentType="tumentech:clientPortalUser"
          extraTabs={[]}
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default ClientPortalUserDetails;
