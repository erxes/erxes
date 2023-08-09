import * as compose from 'lodash.flowright';

import { IJobRefer, JobCategoriesQueryResponse } from '../../types';
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
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { jobCategoriesQuery } = this.props;

    if (jobCategoriesQuery.loading) {
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
            uom: e.uom,
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
            uom: e.uom,
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

    const updatedProps = {
      ...this.props,
      renderButton,
      jobCategories
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
    })
  )(ProductFormContainer)
);
