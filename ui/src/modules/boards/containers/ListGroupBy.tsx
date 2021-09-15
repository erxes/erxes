import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import client from 'apolloClient';
import { __, withProps, confirm, Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from 'modules/boards/graphql';
import ListGroupBy from '../components/stage/ListGroupBy';
import { mutations } from '../graphql';
import {
  IFilterParams,
  IOptions,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../types';

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
  itemsQuery?: ItemsQueryResponse;
  removeStageMutation: RemoveStageMutation;
} & StageProps;

type State = {
  items: any[];
};

class StageContainer extends React.PureComponent<FinalStageProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: []
    };
  }

  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { itemsQuery, options } = nextProps;

    if (itemsQuery && !itemsQuery.loading) {
      const items = itemsQuery[options.queriesName.itemsQuery] || [];

      this.setState({ items });
    }
  }

  loadMore = () => {
    const { groupObj, groupType, queryParams, options } = this.props;

    const items = this.state.items;

    if (items.length === groupObj.itemsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(options.queries.itemsQuery),
        variables: {
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

  archiveList = () => {
    const { groupObj, refetchStages, options } = this.props;

    confirm(__('Archive this list?')).then(() => {
      client
        .mutate({
          mutation: gql(mutations.stagesEdit),
          variables: {
            _id: groupObj._id,
            type: options.type,
            status: 'archived'
          }
        })
        .then(() => {
          Alert.success('Archive List has been archived.');

          refetchStages({ pipelineId: groupObj.pipelineId });
        })
        .catch((e: Error) => {
          Alert.error(e.message);
        });
    });
  };

  archiveItems = () => {
    const { options, groupObj } = this.props;

    const stageId = groupObj._id;

    confirm(__('Archive All Cards in This List?')).then(() => {
      const proccessId = Math.random().toString();
      localStorage.setItem('proccessId', proccessId);

      client
        .mutate({
          mutation: gql(options.mutations.archiveMutation),
          variables: { stageId },
          refetchQueries: [
            {
              query: gql(queries.stageDetail),
              variables: { _id: stageId, proccessId }
            }
          ]
        })
        .then(() => {
          Alert.success('Archive Items has been archived.');
        })
        .catch((e: Error) => {
          Alert.error(e.message);
        });
    });
  };

  removeStage = (id: string) => {
    const { removeStageMutation, refetchStages, groupObj } = this.props;

    const message =
      'This will permanently delete any items related to this stage. Are you absolutely sure?';

    confirm(message, { hasDeleteConfirm: true })
      .then(() => {
        removeStageMutation({ variables: { _id: id } }).then(() => {
          Alert.success('You have successfully removed a stage');

          refetchStages({ pipelineId: groupObj.pipelineId });
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
      options
    } = this.props;

    const refetch = () => {
      if (itemsQuery) {
        itemsQuery.refetch().then(({ data }) => {
          this.setState({
            items: data[options.queriesName.itemsQuery] || []
          });
        });
      }
    };

    return (
      <ListGroupBy
        options={options}
        groupObj={groupObj}
        groupType={groupType}
        index={index}
        length={length}
        items={this.state.items}
        loadMore={this.loadMore}
        onAddItem={refetch}
        onRemoveItem={refetch}
        refetch={refetch}
        archiveList={this.archiveList}
        removeStage={this.removeStage}
        archiveItems={this.archiveItems}
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

  if (groupType === 'label') {
    selectType.labelIds = [groupObj._id];
  } else if (groupType === 'assignee') {
    selectType.assignedUserIds = [groupObj._id];
  } else if (groupType === 'priority') {
    selectType.priority = [groupObj._id];
  } else if (groupType === 'assign') {
    selectType.assignedUserIds = [groupObj._id];
  } else if (groupType === 'dueDate') {
    selectType.startDate = groupObj.startDate;
    selectType.endDate = groupObj.endDate;
  } else {
    selectType.stageId = groupObj._id;
  }

  return selectType;
};

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ groupObj, groupType, queryParams }) => ({
          variables: {
            ...getFilterParams(
              groupObj,
              groupType,
              queryParams,
              options.getExtraParams
            )
          }
        })
      }),
      graphql<StageProps>(gql(mutations.stagesRemove), {
        name: 'removeStageMutation'
      })
    )(StageContainer)
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
