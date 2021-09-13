import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import client from 'apolloClient';
import { __, withProps, confirm, Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from 'modules/boards/graphql';
import ListStage from '../components/stage/ListStage';
import { mutations } from '../graphql';
import {
  IFilterParams,
  IOptions,
  IStage,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../types';

type StageProps = {
  stage: IStage;
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
    const { stage, queryParams, options } = this.props;

    const items = this.state.items;

    if (items.length === stage.itemsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(options.queries.itemsQuery),
        variables: {
          stageId: stage._id,
          pipelineId: stage.pipelineId,
          skip: items.length,
          ...getFilterParams(queryParams, options.getExtraParams)
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
    const { stage, refetchStages, options } = this.props;

    confirm(__('Archive this list?')).then(() => {
      client
        .mutate({
          mutation: gql(mutations.stagesEdit),
          variables: {
            _id: stage._id,
            type: options.type,
            status: 'archived'
          }
        })
        .then(() => {
          Alert.success('Archive List has been archived.');

          refetchStages({ pipelineId: stage.pipelineId });
        })
        .catch((e: Error) => {
          Alert.error(e.message);
        });
    });
  };

  archiveItems = () => {
    const { options, stage } = this.props;

    const stageId = stage._id;

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
    const { removeStageMutation, refetchStages, stage } = this.props;

    const message =
      'This will permanently delete any items related to this stage. Are you absolutely sure?';

    confirm(message, { hasDeleteConfirm: true })
      .then(() => {
        removeStageMutation({ variables: { _id: id } }).then(() => {
          Alert.success('You have successfully removed a stage');

          refetchStages({ pipelineId: stage.pipelineId });
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { index, length, stage, itemsQuery, options } = this.props;

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
      <ListStage
        options={options}
        stage={stage}
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
  queryParams: IFilterParams,
  getExtraParams: (queryParams) => any
) => {
  if (!queryParams) {
    return {};
  }

  return {
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
    ...getExtraParams(queryParams)
  };
};

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ stage, queryParams }) => ({
          variables: {
            stageId: stage._id,
            pipelineId: stage.pipelineId,
            ...getFilterParams(queryParams, options.getExtraParams)
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
