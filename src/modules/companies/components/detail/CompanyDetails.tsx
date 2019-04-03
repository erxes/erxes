import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import { ICompany, ICompanyActivityLog } from 'modules/companies/types';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  company: ICompany;
  currentUser: IUser;
  companyActivityLog: ICompanyActivityLog[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { company, taggerRefetchQueries } = this.props;

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
        content={<div />}
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;
