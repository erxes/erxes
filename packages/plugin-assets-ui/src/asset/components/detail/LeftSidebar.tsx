import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { gql } from '@apollo/client';
import React from 'react';
import { IAsset } from '../../../common/types';
import { queries } from '../../graphql';
import BasicInfo from '../../containers/detail/BasicInfo';
import CustomFieldsSection from '../../containers/detail/CustomFieldSection';

type Props = {
  asset: IAsset;
  refetchDetail: () => void;
};

const LeftSidebar = (props: Props) => {
  const { asset } = props;

  const refetchQueries = [
    {
      query: gql(queries.assetDetail),
      variables: { _id: asset._id },
    },
  ];

  return (
    <Sidebar wide={true}>
      <BasicInfo asset={asset} refetchQueries={refetchQueries} />
      <CustomFieldsSection asset={asset} />
    </Sidebar>
  );
};

export default LeftSidebar;
