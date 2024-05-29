import { IUser } from 'modules/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import WithPermission from '@erxes/ui/src/components/WithPermission';
import { FullContent, MiddleContent } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import OrganizationProfile from '../containers/OrganizationProfile';
import { IOrganization } from '../types';
import Overview from './Overview';
import { StatusBox, StatusTitle, CenterFlexRow } from '../styles';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  currentUser: IUser;
  currentOrganization: IOrganization;
  usersTotalCount: number;
};

class Plans extends React.Component<Props> {
  renderHeader() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Organization settings') },
    ];

    return (
      <Wrapper.Header
        breadcrumb={breadcrumb}
        title={__('Organization settings')}
      />
    );
  }

  renderDPA() {
    return (
      <StatusBox largePadding={true}>
        <StatusTitle>{__('Data Processing Agreement')}</StatusTitle>
        <CenterFlexRow>
          <p>
            Click on the <i>Download</i> button to review and download the DPA
            as a pdf
          </p>
          <Button btnStyle="primary" icon="download-1" href="/dpa">
            Download
          </Button>
        </CenterFlexRow>
      </StatusBox>
    );
  }

  render() {
    const { currentOrganization, currentUser, usersTotalCount } = this.props;

    const fallbackComponent = (
      <EmptyState text="Permission denied" image="/images/actions/21.svg" />
    );

    const content = (
      <WithPermission
        action="editOrganizationInfo"
        fallbackComponent={fallbackComponent}
      >
        <FullContent $center={true}>
          <MiddleContent $transparent={true}>
            <OrganizationProfile currentOrganization={currentOrganization} />
            <Overview
              currentUser={currentUser}
              currentOrganization={currentOrganization}
              usersTotalCount={usersTotalCount}
            />
            {this.renderDPA()}
          </MiddleContent>
        </FullContent>
      </WithPermission>
    );

    return (
      <Wrapper
        header={this.renderHeader()}
        content={content}
        transparent={true}
      />
    );
  }
}

export default Plans;
