import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  company: ICompany;
  currentUser: IUser;
  taggerRefetchQueries?: any[];
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { company, taggerRefetchQueries } = this.props;

    const title = company.primaryName || 'Unknown';

    const breadcrumb = [
      { title: __('Contacts'), link: '/contacts' },
      { title: __('Companies'), link: '/contacts/companies' },
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
