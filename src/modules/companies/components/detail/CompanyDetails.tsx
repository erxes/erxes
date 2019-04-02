import { IUser } from 'modules/auth/types';
import { DetailContent } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ICompany, ICompanyActivityLog } from 'modules/companies/types';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { withRouter } from 'react-router';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  company: ICompany;
  currentUser: IUser;
  companyActivityLog: ICompanyActivityLog[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
  history: any;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const {
      company,
      currentUser,
      loadingLogs,
      companyActivityLog,
      taggerRefetchQueries,
      history
    } = this.props;

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title: company.primaryName || 'N/A' }
    ];

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
        content={
          <DetailContent
            activityLog={companyActivityLog}
            currentUser={currentUser}
            target={company.primaryName || ''}
            loadingLogs={loadingLogs}
            contentType="company"
            contentTypeId={company._id}
            toEmails={company.emails}
            history={history}
          />
        }
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;
