import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import BasicInfo from 'modules/companies/containers/detail/BasicInfo';
import { ICompany } from 'modules/companies/types';
import { UserHeader } from 'modules/customers/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import InfoSection from '../common/InfoSection';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

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
          contentType="company"
          toEmails={company.emails}
          showEmail={false}
        />
        <ActivityLogs
          target={company.primaryName || ''}
          contentId={company._id}
          contentType="company"
          extraTabs={[]}
        />
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
