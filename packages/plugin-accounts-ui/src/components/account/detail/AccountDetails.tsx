import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import { IAccount } from '../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import LeftSidebar from './LeftSidebar';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  account: IAccount;
  currentUser: IUser;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { account } = this.props;

    const title = account.name || 'Unknown';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Account'), link: '/settings/account' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={account._id}
          contentType="accounts:account"
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={account.name || ''}
            contentId={account._id}
            contentType="accounts:account"
            extraTabs={[]}
          />
        )}
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;
