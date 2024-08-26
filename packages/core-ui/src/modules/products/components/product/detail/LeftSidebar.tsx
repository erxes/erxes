import { gql } from "@apollo/client";
import TaggerSection from "@erxes/ui-contacts/src/customers/components/common/TaggerSection";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import BasicInfo from "../../../containers/product/detail/BasicInfo";
import CustomFieldsSection from "../../../containers/product/detail/CustomFieldsSection";
import { IProduct } from "../../../types";
import React from "react";
import { queries } from "../../../graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { IUser } from "@erxes/ui/src/auth/types";

type Props = {
  product: IProduct;
  currentUser?: IUser;
};

const LeftSidebar: React.FC<Props> = props => {
  const { product, currentUser = {} as IUser } = props;

  const refetchQueries = [
    {
      query: gql(queries.productDetail),
      variables: { _id: product._id }
    }
  ];

  return (
    <Sidebar wide={true}>
      <BasicInfo
        product={product}
        currentUser={currentUser}
        refetchQueries={refetchQueries}
      />
      <CustomFieldsSection product={product} />

      <TaggerSection
        data={product}
        type="core:product"
        refetchQueries={refetchQueries}
      />
    </Sidebar>
  );
};

export default LeftSidebar;
