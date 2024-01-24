import { gql } from '@apollo/client';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from './../../containers/item/ItemBasicInfo';
import { IItem } from './../../types';
import React from 'react';
import { queries } from './../../graphql';

type Props = {
  item: IItem;
};

function LeftSidebar(props: Props) {
  const { item } = props;

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

export default LeftSidebar;
