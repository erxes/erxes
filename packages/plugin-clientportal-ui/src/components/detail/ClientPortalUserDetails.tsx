import { __, ActivityInputs, Wrapper } from '@erxes/ui/src';
import React from 'react';
import { IClientPortalUser } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { IUser } from '@erxes/ui/src/auth/types';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import BasicInfo from '../../containers/details/BasicInfo';
import InfoSection from './InfoSection';

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
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        mainHead={
          <UserHeader>
            <InfoSection clientPortalUser={clientPortalUser}>
              <BasicInfo clientPortalUser={clientPortalUser} />
            </InfoSection>
          </UserHeader>
        }
        leftSidebar={<LeftSidebar {...this.props} />}
        rightSidebar={<RightSidebar clientPortalUser={clientPortalUser} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default ClientPortalUserDetails;
