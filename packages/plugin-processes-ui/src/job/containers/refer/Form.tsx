import * as compose from 'lodash.flowright';

import { IJobRefer, JobCategoriesQueryResponse } from '../../types';
import {
  IConfigsMap,
  ProductsConfigsQueryResponse,
  UomsQueryResponse
} from '@erxes/ui-products/src/types';
import { queries as productQueries } from '@erxes/ui-products/src/graphql';
import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import From from '../../components/refer/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { IProductsData } from '../../../types';

type Props = {
  jobRefer?: IJobRefer;
  closeModal: () => void;
};

type FinalProps = {
  jobCategoriesQuery: JobCategoriesQueryResponse;
  productsConfigsQuery: ProductsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { jobCategoriesQuery, productsConfigsQuery, uomsQuery } = this.props;

    if (
      jobCategoriesQuery.loading ||
      productsConfigsQuery.loading ||
      uomsQuery.loading
    ) {
      return null;
    }

    const renderButton = ({
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const { duration, needProducts, resultProducts, quantity } = values;

      values.duration = Number(duration);
      values.quantity = Number(quantity);

      values.needProducts = needProducts.map(
        e =>
          ({
            _id: e._id,
            productId: e.productId,
            quantity: e.quantity,
            uomId: e.uomId,
            branchId: e.branchId,
            departmentId: e.departmentId
          } as IProductsData)
      );

      values.resultProducts = resultProducts.map(
        e =>
          ({
            _id: e._id,
            productId: e.productId,
            quantity: e.quantity,
            uomId: e.uomId,
            branchId: e.branchId,
            departmentId: e.departmentId,
            proportion: e.proportion
          } as IProductsData)
      );

      return (
        <ButtonMutate
          mutation={object ? mutations.jobRefersEdit : mutations.jobRefersAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries('test refetch')}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const jobCategories = jobCategoriesQuery.jobCategories || [];
    const configs = productsConfigsQuery.productsConfigs || [];
    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    const uoms = uomsQuery.uoms || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      jobCategories,
      uoms,
      configsMap: configsMap || ({} as IConfigsMap)
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = test => {
  return ['jobRefers', 'jobReferTotalCount', 'jobCategories'];
};

export default withProps<Props>(
  compose(
    graphql<Props, JobCategoriesQueryResponse>(gql(queries.jobCategories), {
      name: 'jobCategoriesQuery'
    }),
    graphql<{}, UomsQueryResponse>(gql(productQueries.uoms), {
      name: 'uomsQuery'
    }),
    graphql<{}, ProductsConfigsQueryResponse>(
      gql(productQueries.productsConfigs),
      {
        name: 'productsConfigsQuery'
      }
    )
  )(ProductFormContainer)
);
