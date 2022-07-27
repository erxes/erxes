import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import { __, ActivityInputs, Wrapper } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import BasicInfo from '../../containers/details/BasicInfo';
import { IClientPortalUser } from '../../types';
import InfoSection from './InfoSection';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  clientPortalUser: IClientPortalUser;
  currentUser: IUser;
  history: any;
};

class ClientPortalCompanyDetails extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    const title = clientPortalUser.companyName || 'Unknown';

    const breadcrumb = [
      {
        title: __('ClientPortal Companies'),
        link: '/settings/client-portal/user'
      },
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

export default ClientPortalCompanyDetails;
