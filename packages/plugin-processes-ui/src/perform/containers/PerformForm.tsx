import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

import { FlowsAllQueryResponse, IFlowDocument, IJob } from '../../flow/types';
import { IJobRefer, JobRefersAllQueryResponse } from '../../job/types';
import Form from '../components/perform/PerformForm';
import { mutations } from '../graphql';
import {
  IOverallWorkDocument,
  OverallWorksSideBarDetailQueryResponse
} from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { queries as jobQueries } from '../../job/graphql';
import gql from 'graphql-tag';
import { queries as flowQueries } from '../../flow/graphql';
import { queries } from '../graphql';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDocument;
  max: number;
  jobRefers: IJobRefer[];
  flows: IFlowDocument[];
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    const { overallWorkDetail, max, jobRefers, flows } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const { count, performNeedProducts, performResultProducts } = values;

      console.log(
        'on renderButton container: ',
        count,
        performNeedProducts,
        performResultProducts
      );

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

export default ProductFormContainer;
