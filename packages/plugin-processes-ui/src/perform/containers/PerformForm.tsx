import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

import { IFlowDocument } from '../../flow/types';
import { IJobRefer, IProduct } from '../../job/types';
import Form from '../components/perform/PerformForm';
import { mutations } from '../graphql';
import { AllProductsQueryResponse, IOverallWorkDocument } from '../types';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import { queries } from '../graphql';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDocument;
  max: number;
  jobRefers: IJobRefer[];
  flows: IFlowDocument[];
};

type FinalProps = {
  allProductsQuery: AllProductsQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      overallWorkDetail,
      max,
      jobRefers,
      flows,
      allProductsQuery
    } = this.props;

    if (allProductsQuery.loading) {
      return null;
    }

    const products: IProduct[] = allProductsQuery.allProducts || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const { count, performNeedProducts, performResultProducts } = values;

      for (const need of performNeedProducts) {
        need.product = '';
        need.uom = '';
      }

      for (const result of performResultProducts) {
        result.product = '';
        result.uom = '';
      }

      const doc = {
        startAt: new Date(),
        endAt: new Date(),
        dueDate: new Date(),
        overallWorkId: overallWorkDetail._id,
        status: 'new',
        count: Number(count).toString(),
        needProducts: performNeedProducts,
        resultProducts: performResultProducts
      };

      return (
        <ButtonMutate
          mutation={mutations.performsAdd}
          variables={doc}
          callback={callback}
          refetchQueries={getRefetchQueries('test refetch')}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully added a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return (
      <Form
        {...updatedProps}
        overallWorkDetail={overallWorkDetail}
        max={max}
        jobRefers={jobRefers}
        flows={flows}
        products={products}
      />
    );
  }
}

const getRefetchQueries = test => {
  console.log(test);
  return [
    'performsByOverallWorkId',
    'performsByOverallWorkIdTotalCount',
    'jobRefersAllQuery',
    'flowsAllQuery'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, AllProductsQueryResponse, {}>(gql(queries.allProducts), {
      name: 'allProductsQuery'
    })
  )(ProductFormContainer)
);
