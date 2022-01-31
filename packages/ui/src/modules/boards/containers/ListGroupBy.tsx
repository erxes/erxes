import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import client from 'apolloClient';
import { withProps, Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import ListGroupBy from '../components/stage/ListGroupBy';
import { mutations } from '../graphql';
import {
  IFilterParams,
  IOptions,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../types';
import Spinner from 'modules/common/components/Spinner';

type StageProps = {
  groupObj: any;
  groupType: string;
  index: number;
  queryParams: IFilterParams;
  options: IOptions;
  refetchStages: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
  length: number;
};

type FinalStageProps = {
  addMutation: SaveItemMutation;
  itemsQuery: ItemsQueryResponse;
  itemsTotalCountQuery: any;
  removeStageMutation: RemoveStageMutation;
} & StageProps;

type State = {
  items: any[];
  itemsTotalCount: number;
};

class ListGroupByContainer extends React.PureComponent<FinalStageProps, State> {
  constructor(props) {
    super(props);

    const { itemsQuery, itemsTotalCountQuery, options } = props;

    this.state = {
      items: itemsQuery[options.queriesName.itemsQuery] || [],
      itemsTotalCount:
        itemsTotalCountQuery[options.queriesName.itemsTotalCountQuery || ''] ||
        0
    };
  }

  componentWillReceiveProps(nextProps: FinalStageProps) {
    const {
      itemsQuery,
      itemsTotalCountQuery,
      options,
      queryParams
    } = nextProps;

    if (this.queryParamsChanged(this.props.queryParams, queryParams)) {
      itemsQuery.refetch();
    }

    if (!itemsQuery.loading && !itemsTotalCountQuery.loading) {
      const items = itemsQuery[options.queriesName.itemsQuery] || [];
      const itemsTotalCount =
        itemsTotalCountQuery[options.queriesName.itemsTotalCountQuery || ''] ||
        0;

      this.setState({ items, itemsTotalCount });
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

  loadMore = () => {
    const { groupObj, groupType, queryParams, options } = this.props;

    const { items, itemsTotalCount } = this.state;

    if (items.length === itemsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(options.queries.itemsQuery),
        variables: {
          skip: items.length,
          ...getFilterParams(
            groupObj,
            groupType,
            queryParams,
            options.getExtraParams
          )
        },
        fetchPolicy: 'network-only'
      })
      .then(({ data }) => {
        this.setState({
          items: [...items, ...(data[options.queriesName.itemsQuery] || [])]
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const {
      index,
      length,
      groupObj,
      groupType,
      itemsQuery,
      itemsTotalCountQuery,
      options
    } = this.props;

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    const refetch = () => {
      itemsQuery.refetch().then(({ data }) => {
        this.setState({
          items: data[options.queriesName.itemsQuery] || []
        });
      });

      itemsTotalCountQuery.refetch();
    };

    const { items, itemsTotalCount } = this.state;

    return (
      <ListGroupBy
        options={options}
        groupObj={groupObj}
        groupType={groupType}
        index={index}
        length={length}
        items={items}
        itemsTotalCount={itemsTotalCount}
        loadMore={this.loadMore}
        onAddItem={refetch}
        onRemoveItem={refetch}
        refetch={refetch}
      />
    );
  }
}

const getFilterParams = (
  groupObj: any,
  groupType: string,
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
    ...getExtraParams(queryParams)
  };

  switch (groupType) {
    case 'label': {
      selectType.labelIds = [groupObj._id];

      break;
    }
    case 'priority': {
      selectType.priority = [groupObj._id];

      break;
    }
    case 'assignee': {
      selectType.assignedUserIds = [groupObj._id];

      break;
    }
    case 'dueDate': {
      selectType.closeDateType = groupObj.value;

      break;
    }
    default: {
      selectType.stageId = groupObj._id;
    }
  }

  return selectType;
};

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ groupObj, groupType, queryParams }) => ({
          variables: getFilterParams(
            groupObj,
            groupType,
            queryParams,
            options.getExtraParams
          ),
          fetchPolicy: 'network-only'
        })
      }),
      graphql<StageProps>(gql(options.queries.itemsTotalCountQuery), {
        name: 'itemsTotalCountQuery',
        options: ({ groupObj, groupType, queryParams }) => ({
          variables: getFilterParams(
            groupObj,
            groupType,
            queryParams,
            options.getExtraParams
          ),
          fetchPolicy: 'network-only'
        })
      }),
      graphql<StageProps>(gql(mutations.stagesRemove), {
        name: 'removeStageMutation'
      })
    )(ListGroupByContainer)
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
