import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import GanttChart from '../../components/gantt/GanttChart';
import {
  IFilterParams,
  IOptions,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../../types';
import Spinner from 'modules/common/components/Spinner';

type StageProps = {
  groupType: string;
  queryParams: IFilterParams;
  options: IOptions;
  refetchStages: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
  length: number;
};

type FinalStageProps = {
  addMutation: SaveItemMutation;
  itemsQuery: ItemsQueryResponse;
  removeStageMutation: RemoveStageMutation;
} & StageProps;

type State = {
  items: any[];
};

class GanttGroupByContainer extends React.PureComponent<
  FinalStageProps,
  State
> {
  constructor(props) {
    super(props);

    const { itemsQuery, options } = props;

    this.state = {
      items: itemsQuery[options.queriesName.itemsQuery] || []
    };
  }

  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { itemsQuery, options, queryParams } = nextProps;

    if (this.queryParamsChanged(this.props.queryParams, queryParams)) {
      itemsQuery.refetch();
    }

    if (!itemsQuery.loading) {
      const items = itemsQuery[options.queriesName.itemsQuery] || [];
      this.setState({ items });
    }
  }

  queryParamsChanged = (queryParams: any, nextQueryParams: any) => {
    if (nextQueryParams.itemId || (!queryParams.key && queryParams.itemId)) {
      return false;
    }

    if (queryParams !== nextQueryParams) {
      return true;
    }

    return false;
  };

  render() {
    const { length, groupType, itemsQuery, options } = this.props;

    console.log('========================================');
    console.log('itemsQuery loading: ', itemsQuery.loading);

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    const refetch = () => {
      itemsQuery.refetch().then(({ data }) => {
        this.setState({
          items: data[options.queriesName.itemsQuery] || []
        });
      });
    };

    const { items } = this.state;

    return (
      <GanttChart
        options={options}
        groupType={groupType}
        length={length}
        items={items}
        refetch={refetch}
      />
    );
  }
}

const getFilterParams = (
  queryParams: IFilterParams,
  getExtraParams: (queryParams) => any
) => {
  if (!queryParams) {
    return {};
  }

  const selectType = {
    search: queryParams.search,
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    closeDateType: queryParams.closeDateType,
    labelIds: queryParams.labelIds,
    userIds: queryParams.userIds,
    segment: queryParams.segment,
    assignedToMe: queryParams.assignedToMe,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    pipelineId: queryParams.pipelineId,
    limit: 100,
    ...getExtraParams(queryParams)
  };

  return selectType;
};

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ queryParams }) => ({
          variables: getFilterParams(queryParams, options.getExtraParams),
          fetchPolicy: 'network-only'
        })
      })
    )(GanttGroupByContainer)
  );
};

class WithData extends React.Component<StageProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ options: props.options });
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}

export default withProps<StageProps>(WithData);
