import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

import { FlowsAllQueryResponse, IFlowDocument, IJob } from '../../flow/types';
import { IJobRefer, JobRefersAllQueryResponse } from '../../job/types';
import Form from '../components/perform/PerformForm';
import { mutations } from '../graphql';
import { IOverallWork, OverallWorksSideBarDetailQueryResponse } from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { queries as jobQueries } from '../../job/graphql';
import gql from 'graphql-tag';
import { queries as flowQueries } from '../../flow/graphql';
import { queries } from '../graphql';

type Props = {
  closeModal: () => void;
  history: any;
  queryParams: any;
  max: number;
};

type FinalProps = {
  jobRefersAllQuery: JobRefersAllQueryResponse;
  flowsAllQuery: FlowsAllQueryResponse;
  overallWorksSideBarDetailQuery: OverallWorksSideBarDetailQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      overallWorksSideBarDetailQuery,
      max,
      jobRefersAllQuery,
      flowsAllQuery
    } = this.props;

    if (
      overallWorksSideBarDetailQuery.loading ||
      jobRefersAllQuery.loading ||
      flowsAllQuery.loading
    ) {
      return false;
    }

    const jobRefers = jobRefersAllQuery.jobRefersAll || [];
    const flows = flowsAllQuery.flowsAll || [];
    const overallWorkDetail =
      overallWorksSideBarDetailQuery.overallWorksSideBarDetail;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const { count, performNeedProducts, performResultProducts } = values;

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

export default withProps<Props>(
  compose(
    graphql<Props, JobRefersAllQueryResponse, {}>(
      gql(jobQueries.jobRefersAll),
      {
        name: 'jobRefersAllQuery',
        options: { fetchPolicy: 'no-cache' }
      }
    ),
    graphql<Props, FlowsAllQueryResponse, {}>(gql(flowQueries.flowsAll), {
      name: 'flowsAllQuery'
    }),
    graphql<Props, OverallWorksSideBarDetailQueryResponse, {}>(
      gql(queries.overallWorksSideBarDetail),
      {
        name: 'overallWorksSideBarDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            id: queryParams.overallWorkId
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductFormContainer)
);
