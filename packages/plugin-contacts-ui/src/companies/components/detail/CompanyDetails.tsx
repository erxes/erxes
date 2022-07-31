import ActivityLogs from '@erxes/ui/src/activityLogs/containers/ActivityLogs';
import ActivityInputs from '@erxes/ui/src/activityLogs/components/ActivityInputs';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from '@erxes/ui/src/utils/core';
import BasicInfo from '../../containers/detail/BasicInfo';
import { ICompany } from '@erxes/ui/src/companies/types';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import InfoSection from '../common/InfoSection';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  company: ICompany;
  fields: IField[];
  currentUser: IUser;
  taggerRefetchQueries?: any[];
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { company, taggerRefetchQueries } = this.props;

    const title = company.primaryName || 'Unknown';

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={company._id}
          contentType="contacts:company"
          toEmails={company.emails}
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={company.primaryName || ''}
            contentId={company._id}
            contentType="contacts:company"
            extraTabs={[{ name: 'cards:task', label: 'Task' }]}
          />
        )}
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        mainHead={
          <UserHeader>
            <InfoSection company={company}>
              <BasicInfo company={company} />
            </InfoSection>
          </UserHeader>
        }
        leftSidebar={
          <LeftSidebar
            {...this.props}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar company={company} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;
