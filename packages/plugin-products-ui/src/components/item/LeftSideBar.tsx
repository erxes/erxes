import { gql } from '@apollo/client';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from './../../containers/item/ItemBasicInfo';
import { IItem } from './../../types';
import React from 'react';
import { queries } from './../../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  item: IItem;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { item } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.itemsDetail),
        variables: { _id: item._id },
      },
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo item={item} refetchQueries={refetchQueries} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
