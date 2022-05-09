import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { withProps } from '@erxes/ui/src/utils';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import From from '../components/Form';
import { mutations } from '../graphql';
import { queries as productQueries } from '@erxes/ui-products/src/graphql';
import { queries as spinCampaignQueries } from '../../spinCampaign/graphql';
import { queries as lotteryCampaignQueries } from '../../lotteryCampaign/graphql';
import { IVoucherCampaign } from '../types';
import {
  ProductCategoriesQueryResponse,
  ProductsQueryResponse
} from '@erxes/ui-products/src/types';
import { SpinCampaignQueryResponse } from '../../spinCampaign/types';
import { LotteryCampaignQueryResponse } from '../../lotteryCampaign/types';

type Props = {
  voucherCampaign?: IVoucherCampaign;
  closeModal: () => void;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsQuery: ProductsQueryResponse;
  spinCampaignQuery: SpinCampaignQueryResponse;
  lotteryCampaignQuery: LotteryCampaignQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productsQuery,
      spinCampaignQuery,
      lotteryCampaignQuery
    } = this.props;

    if (
      productCategoriesQuery.loading ||
      productsQuery.loading ||
      spinCampaignQuery.loading ||
      lotteryCampaignQuery.loading
    ) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(att => {
        attachmentMoreArray.push({ ...att, __typename: undefined });
      });

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;
      values.attachmentMore = attachmentMoreArray;

      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.voucherCampaignsEdit
              : mutations.voucherCampaignsAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const productCategories = productCategoriesQuery.productCategories || [];
    const products = productsQuery.products || [];
    const spinCampaigns = spinCampaignQuery.spinCampaigns || [];
    const lotteryCampaigns = lotteryCampaignQuery.lotteryCampaigns || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      productCategories,
      products,
      spinCampaigns,
      lotteryCampaigns
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['voucherCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(productQueries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    ),
    graphql<Props, ProductsQueryResponse>(gql(productQueries.products), {
      name: 'productsQuery'
    }),
    graphql<Props, SpinCampaignQueryResponse>(
      gql(spinCampaignQueries.spinCampaigns),
      {
        name: 'spinCampaignQuery'
      }
    ),
    graphql<Props, LotteryCampaignQueryResponse>(
      gql(lotteryCampaignQueries.lotteryCampaigns),
      {
        name: 'lotteryCampaignQuery'
      }
    )
  )(ProductFormContainer)
);
