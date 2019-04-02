import { DetailContent } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { __, renderFullName } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IActivityLogForMonth } from '../../../activityLogs/types';
import { IUser } from '../../../auth/types';
import { ICustomer } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  currentUser: IUser;
  activityLogsCustomer: IActivityLogForMonth[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
  history: any;
};

class CustomerDetails extends React.Component<Props> {
  render() {
    const {
      customer,
      taggerRefetchQueries,
      activityLogsCustomer,
      currentUser,
      loadingLogs,
      history
    } = this.props;

    const breadcrumb = [
      { title: __('Customers'), link: '/customers' },
      { title: renderFullName(customer) }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <LeftSidebar
            wide={true}
            customer={customer}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar customer={customer} />}
        content={
          <DetailContent
            activityLog={activityLogsCustomer}
            currentUser={currentUser}
            target={customer.firstName}
            loadingLogs={loadingLogs}
            contentType="customer"
            contentTypeId={customer._id}
            toEmail={customer.primaryEmail}
            history={history}
          />
        }
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
