import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
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

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title: company.primaryName || 'N/A' }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={company._id}
          contentType="company"
          toEmails={company.emails}
          showEmail={true}
        />
        <ActivityLogs
          target={company.primaryName || ''}
          contentId={company._id}
          contentType="company"
          extraTabs={[
            { name: 'conversation', label: 'Conversation' },
            { name: 'email', label: 'Email' }
          ]}
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
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
