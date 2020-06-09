import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { UserDetailQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { requestIdleCallback } from 'request-idle-callback';
import DragDisabler from '../components/DragDisabler';
import { mutations, queries, subscriptions } from '../graphql';
import {
  IDragResult,
  IFilterParams,
  IItem,
  IItemMap,
  INonFilterParams,
  IOptions,
  IPipeline,
  PipelineDetailQueryResponse
} from '../types';
import { invalidateCache } from '../utils';
import { reorder, reorderItemMap } from '../utils';

type WrapperProps = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  options: IOptions;
  queryParams: IFilterParams & INonFilterParams;
  queryParamsChanged: (
    queryParams: IFilterParams,
    nextQueryParams: IFilterParams
  ) => boolean;
};

type Props = WrapperProps & {
  currentUserQuery: UserDetailQueryResponse;
  pipelineDetailQuery: any;
};

type StageLoadMap = {
  [key: string]: 'readyToLoad' | 'loaded';
};

type State = {
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  isShowLabel: boolean;
  isDragEnabled?: boolean;
};

interface IStore {
  options: IOptions;
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  onLoadStage: (stageId: string, items: IItem[]) => void;
  scheduleStage: (stageId: string) => void;
  onDragEnd: (result: IDragResult) => void;
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  onUpdateItem: (item: IItem, prevStageId?: string) => void;
  isShowLabel: boolean;
  toggleLabels: () => void;
}

const PipelineContext = React.createContext({} as IStore);

export const PipelineConsumer = PipelineContext.Consumer;

type Task = {
  handler: (stageId: string) => void;
  stageId: string;
  isComplete: boolean;
};

class PipelineProviderInner extends React.Component<Props, State> {
  static tasks: Task[] = [];
  static currentTask: Task | null;

  constructor(props: Props) {
    super(props);

    const { pipeline, pipelineDetailQuery, initialItemMap } = props;

    const stageIds = Object.keys(initialItemMap || {});

    this.state = {
      itemMap: initialItemMap || {},
      stageLoadMap: {},
      stageIds,
      isShowLabel: false
    };

    PipelineProviderInner.tasks = [];
    PipelineProviderInner.currentTask = null;

    pipelineDetailQuery.subscribeToMore({
      document: gql(subscriptions.pipelinesChanged),
      variables: { _id: pipeline._id },
      updateQuery: (
        prev,
        {
          subscriptionData: {
            data: { pipelinesChanged }
          }
        }
      ) => {
        if (!pipelinesChanged || !pipelinesChanged.data) {
          return;
        }

        const {
          data: {
            item,
            destinationStageId,
            destinationIndex,
            oldStageId,
            oldIndex
          },
          action,
          proccessId
        } = pipelinesChanged;

        if (proccessId !== localStorage.getItem('proccessId')) {
          if (action === 'orderUpdated') {
            this.onDragEnd(
              {
                destination: {
                  droppableId: destinationStageId,
                  index: destinationIndex
                },
                draggableId: item._id,
                combine: null,
                mode: 'FLUID',
                reason: 'DROP',
                source: {
                  item,
                  droppableId: oldStageId,
                  index: oldIndex
                },
                type: 'DEFAULT'
              },
              false
            );
          }

          if (action === 'itemAdd') {
            this.onAddItem(destinationStageId, item, destinationIndex);
          }

          if (action === 'itemRemove') {
            this.onRemoveItem(item._id, oldStageId);
          }
        }
      }
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { queryParams, queryParamsChanged } = this.props;

    if (queryParamsChanged(queryParams, nextProps.queryParams)) {
      const { stageIds } = this.state;

      PipelineProviderInner.tasks = [];
      PipelineProviderInner.currentTask = null;

      stageIds.forEach((stageId: string) => {
        this.scheduleStage(stageId);
      });
    }
  }

  onDragEnd = (result, saveToDb = true) => {
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering stage
    if (result.type === 'STAGE') {
      const stageIds = reorder(
        this.state.stageIds,
        source.index,
        destination.index
      );

      this.setState({ stageIds });

      // save orders to database
      if (saveToDb) {
        return this.saveStageOrders(stageIds);
      }
    }

    const { itemMap, target, aboveItem } = reorderItemMap({
      itemMap: this.state.itemMap,
      source,
      destination
    });

    this.setState({
      itemMap
    });

    invalidateCache();

    // saving to database
    if (saveToDb) {
      this.itemChange({
        itemId: target._id,
        aboveItemId: aboveItem ? aboveItem._id : '',
        destinationStageId: destination.droppableId,
        destinationIndex: destination.index,
        sourceStageId: source.droppableId,
        sourceIndex: source.index
      });
    }
  };

  refetchQueryVariables = () => {
    const { options, queryParams } = this.props;

    return {
      search: queryParams.search,
      customerIds: queryParams.customerIds,
      companyIds: queryParams.companyIds,
      assignedUserIds: queryParams.assignedUserIds,
      extraParams: options.getExtraParams(queryParams),
      closeDateType: queryParams.closeDateType,
      userIds: queryParams.userIds
    };
  };

  refetchQueryBuild = (stageId: string) => {
    return {
      query: gql(queries.stageDetail),
      variables: {
        _id: stageId,
        ...this.refetchQueryVariables()
      }
    };
  };

  refetchStagesQueryBuild = (pipelineId: string) => {
    return {
      query: gql(queries.stages),
      variables: {
        pipelineId,
        ...this.refetchQueryVariables()
      }
    };
  };

  itemChange = (args: {
    itemId: string;
    aboveItemId?: string;
    destinationStageId: string;
    destinationIndex: number;
    sourceStageId: string;
    sourceIndex: number;
  }) => {
    const {
      itemId,
      aboveItemId,
      destinationStageId,
      destinationIndex,
      sourceStageId,
      sourceIndex
    } = args;

    const { options } = this.props;
    const refetchQueries = [this.refetchQueryBuild(destinationStageId)];

    if (sourceStageId) {
      refetchQueries.unshift(this.refetchQueryBuild(sourceStageId));
    }

    const proccessId = Math.random().toString();
    localStorage.setItem('proccessId', proccessId);

    client
      .mutate({
        mutation: gql(options.mutations.changeMutation),
        variables: {
          itemId,
          aboveItemId,
          destinationStageId,
          destinationIndex,
          sourceStageId,
          sourceIndex,
          proccessId
        },
        refetchQueries
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  saveStageOrders = (stageIds: string[]) => {
    const { pipeline } = this.props;

    client
      .mutate({
        mutation: gql(mutations.stagesUpdateOrder),
        variables: {
          orders: stageIds.map((stageId, index) => ({
            _id: stageId,
            order: index
          }))
        },
        refetchQueries: [this.refetchStagesQueryBuild(pipeline._id)]
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  /*
   * - Stage container is sending loaded to items
   * - Storing sent items to global itemsMap
   * - Mark stage's task as complete
   * - Mark stage's loading state as loaded
   */
  onLoadStage = (stageId: string, items: IItem[]) => {
    const { itemMap, stageLoadMap } = this.state;
    const task = PipelineProviderInner.tasks.find(t => t.stageId === stageId);

    if (task) {
      task.isComplete = true;
    }

    this.setState({
      itemMap: { ...itemMap, [stageId]: items },
      stageLoadMap: { ...stageLoadMap, [stageId]: 'loaded' }
    });
  };

  /*
   * Register given stage to tasks queue
   */
  scheduleStage = (stageId: string) => {
    let currentTask = PipelineProviderInner.currentTask;

    PipelineProviderInner.tasks.push({
      handler: (id: string) => {
        const { stageLoadMap } = this.state;
        const states = Object.values(stageLoadMap);

        if (!states.includes('readyToLoad')) {
          this.setState({
            stageLoadMap: { ...stageLoadMap, [id]: 'readyToLoad' }
          });
        }
      },
      stageId,
      isComplete: false
    });

    if (!currentTask) {
      currentTask = requestIdleCallback(this.runTaskQueue);
    }
  };

  /*
   * If browser is idle then find first inComplete task and run it
   */
  runTaskQueue = (deadline: {
    didTimeout: boolean;
    timeRemaining: () => number;
  }) => {
    const inCompleteTask = PipelineProviderInner.tasks.find(
      (task: Task) => !task.isComplete
    );

    while (
      (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
      inCompleteTask
    ) {
      const { handler, stageId } = inCompleteTask;
      handler(stageId);
    }

    PipelineProviderInner.currentTask = null;

    if (inCompleteTask) {
      PipelineProviderInner.currentTask = requestIdleCallback(
        this.runTaskQueue
      );
    }

    if (PipelineProviderInner.currentTask === null) {
      this.setState({ isDragEnabled: true });
    }
  };

  onAddItem = (stageId: string, item: IItem, index?: number) => {
    const { itemMap } = this.state;
    const items = itemMap[stageId];

    // dot not add to hidden index
    if (!index || items.length >= index) {
      this.setState({
        itemMap: { ...itemMap, [stageId]: [...items, item] }
      });
    }
  };

  onRemoveItem = (itemId: string, stageId: string) => {
    const { itemMap } = this.state;

    const items = itemMap[stageId].filter(item => item._id !== itemId);

    this.setState({
      itemMap: { ...itemMap, [stageId]: items }
    });
  };

  onUpdateItem = (item: IItem, prevStageId?: string) => {
    const { stageId } = item;
    const { itemMap } = this.state;

    // Moved to anothor board or pipeline
    if (!itemMap[stageId] && prevStageId) {
      return this.onRemoveItem(item._id, prevStageId);
    }

    if (item.status === 'archived') {
      return this.onRemoveItem(item._id, item.stageId);
    }

    // Moved between stages
    if (prevStageId && stageId !== prevStageId) {
      // remove from old stage
      let sourceIndex;
      const prevStageItems: IItem[] = [];

      for (let i = 0; i < itemMap[prevStageId].length; i++) {
        const d = itemMap[prevStageId][i];

        if (d._id === item._id) {
          sourceIndex = i;
        } else {
          prevStageItems.push(d);
        }
      }

      // add to new stage's front
      const items = [...itemMap[stageId]];
      items.unshift(item);

      const newitemMap = {
        ...itemMap,
        [stageId]: items,
        [prevStageId]: prevStageItems
      };

      this.setState({ itemMap: newitemMap }, () => {
        this.itemChange({
          itemId: item._id,
          destinationStageId: stageId,
          destinationIndex: 0,
          sourceStageId: prevStageId,
          sourceIndex
        });
      });
    } else {
      const items = [...itemMap[stageId]];
      const index = items.findIndex(d => d._id === item._id);

      items[index] = item;

      this.setState({
        itemMap: { ...itemMap, [stageId]: items }
      });
    }
  };

  toggleLabels = () => {
    this.setState({ isShowLabel: !this.state.isShowLabel });
  };

  render() {
    const {
      itemMap,
      stageLoadMap,
      stageIds,
      isShowLabel,
      isDragEnabled
    } = this.state;

    return (
      <>
        {!isDragEnabled && (
          <DragDisabler width={`${this.state.stageIds.length * 290 - 5}px`} />
        )}

        <PipelineContext.Provider
          value={{
            options: this.props.options,
            onDragEnd: this.onDragEnd,
            onLoadStage: this.onLoadStage,
            scheduleStage: this.scheduleStage,
            onAddItem: this.onAddItem,
            onRemoveItem: this.onRemoveItem,
            onUpdateItem: this.onUpdateItem,
            itemMap,
            stageLoadMap,
            stageIds,
            isShowLabel,
            toggleLabels: this.toggleLabels
          }}
        >
          {this.props.children}
        </PipelineContext.Provider>
      </>
    );
  }
}

export const PipelineProvider = withProps<WrapperProps>(
  compose(
    graphql<Props, PipelineDetailQueryResponse>(gql(queries.pipelineDetail), {
      name: 'pipelineDetailQuery',
      options: ({ pipeline }) => ({
        variables: { _id: pipeline._id }
      })
    })
  )(PipelineProviderInner)
);
