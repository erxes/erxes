import { gql } from '@apollo/client';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from '../../../containers/product/detail/BasicInfo';
import CustomFieldsSection from '../../../containers/product/detail/CustomFieldsSection';
import { IProduct } from '../../../types';
import React from 'react';
import { queries } from '../../../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  product: IProduct;
  currentUser?: IUser;
};

const LeftSidebar: React.FC<Props> = (props) => {
  const { product, currentUser = {} as IUser } = props;

  const refetchQueries = [
    {
      query: gql(queries.productDetail),
      variables: { _id: product._id },
    },
  ];

  return (
    <Sidebar wide={true}>
      <BasicInfo
        product={product}
        currentUser={currentUser}
        refetchQueries={refetchQueries}
      />
      <CustomFieldsSection product={product} />
      {isEnabled('tags') && (
        <TaggerSection
          data={product}
          type="products:product"
          refetchQueries={refetchQueries}
        />
      )}
    </Sidebar>
  );
};

export default withCurrentUser(LeftSidebar);
