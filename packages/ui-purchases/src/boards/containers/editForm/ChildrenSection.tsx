import React from 'react';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as purchaseQueries } from '../../../purchases/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { IOptions } from '../../types';
import { IQueryParams } from '@erxes/ui/src/types';
import { getFilterParams } from '../../utils';
import { PurchasesQueryResponse } from '../../../purchases/types';
import ChildrenSectionComponent from '../../components/editForm/ChildrenSection';

type Props = {
  type: string;
  parentId?: string;
  itemId: string;
  stageId: string;
  queryParams: IQueryParams;
  options: IOptions;
  pipelineId: string;
};

type FinalProps = {
  purchaseQueries: PurchasesQueryResponse;
} & Props;

class ChildrenSection extends React.Component<FinalProps> {
  render() {
    const { type, purchaseQueries, parentId, options } = this.props;

    let children: any[] = [];
    let refetch;

    if (type === 'purchase') {
      children = purchaseQueries.purchases;
      refetch = purchaseQueries.refetch;
    }

    const updatedProps = {
      ...this.props,
      children,
      parentId: parentId || '',
      options,
      refetch,
    };

    return <ChildrenSectionComponent {...updatedProps} />;
  }
}

const commonFilter = ({
  itemId,
  queryParams,
  options,
}: {
  itemId: string;
  queryParams: IQueryParams;
  options: IOptions;
}) => ({
  variables: {
    parentId: itemId,
    ...getFilterParams(queryParams, options.getExtraParams),
    hasStartAndCloseDate: false,
  },
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(purchaseQueries.purchases), {
      name: 'purchaseQueries',
      skip: ({ type }) => type !== 'purchase',
      options: (props) => commonFilter(props),
    })
  )(ChildrenSection)
);
