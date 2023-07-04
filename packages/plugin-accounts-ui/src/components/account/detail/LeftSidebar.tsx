import { gql } from '@apollo/client';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from '../../../containers/account/detail/BasicInfo';
import CustomFieldsSection from '../../../containers/account/detail/CustomFieldsSection';
import { IAccount } from '../../../types';
import React from 'react';
import { queries } from '../../../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  account: IAccount;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { account } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.accountDetail),
        variables: { _id: account._id }
      }
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo account={account} refetchQueries={refetchQueries} />
        <CustomFieldsSection account={account} />
        {isEnabled('tags') && (
          <TaggerSection
            data={account}
            type="accounts:account"
            refetchQueries={refetchQueries}
          />
        )}
      </Sidebar>
    );
  }
}

export default LeftSidebar;
