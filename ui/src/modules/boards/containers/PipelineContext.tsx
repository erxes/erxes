import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { requestIdleCallback } from 'request-idle-callback';
import { mutations, queries } from '../graphql';
import {
  IDragResult,
  IFilterParams,
  IItem,
  IItemMap,
  IOptions,
  IPipeline
} from '../types';
import { invalidateCache } from '../utils';
import { collectOrders, reorder, reorderItemMap } from '../utils';

type Props = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  options: IOptions;
  queryParams: IFilterParams;
  queryParamsChanged: (queryParams: IFilterParams, args: any) => boolean;
};

type StageLoadMap = {
  [key: string]: 'readyToLoad' | 'loaded';
};

type State = {
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  isShowLabel: boolean;
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

export class PipelineProvider extends React.Component<Props, State> {
  static tasks: Task[] = [];
  static currentTask: Task | null;

  constructor(props: Props) {
    super(props);

    const { initialItemMap } = props;

    this.state = {
      itemMap: initialItemMap || {},
      stageLoadMap: {},
      stageIds: Object.keys(initialItemMap || {}),
      isShowLabel: false
    };

    PipelineProvider.tasks = [];
    PipelineProvider.currentTask = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    const { queryParams, queryParamsChanged, initialItemMap } = this.props;

    if (queryParamsChanged(queryParams, nextProps)) {
      const { stageIds } = this.state;

      PipelineProvider.tasks = [];
      PipelineProvider.currentTask = null;

      stageIds.forEach((stageId: string) => {
        this.scheduleStage(stageId);
      });
    }

    // when adding or removing stage
    const nextStageIds = Object.keys(nextProps.initialItemMap || {});
    const nowStageIds = Object.keys(initialItemMap || {});

    if (nextStageIds.length !== nowStageIds.length) {
      let stageIds = [...this.state.stageIds];
      const itemMap = { ...this.state.itemMap };

      const newStageId = nextStageIds.find(
        stageId => !stageIds.includes(stageId)
      );

      if (newStageId) {
        stageIds.push(newStageId);

        itemMap[newStageId] = [];
      } else {
        const deletedStageId = stageIds.find(
          stageId => !nextStageIds.includes(stageId)
        );

        stageIds = stageIds.filter(stageId => deletedStageId !== stageId);

        delete itemMap[deletedStageId || ''];
      }

      this.setState({
        stageIds,
        itemMap
      });
    }
  }

  onDragEnd = result => {
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
      return this.saveStageOrders(stageIds);
    }

    const { itemMap } = reorderItemMap({
      itemMap: this.state.itemMap,
      source,
      destination
    });

    // update item to database
    this.itemChange(result.draggableId, destination.droppableId);

    this.setState({
      itemMap
    });

    invalidateCache();

    // save orders to database
    return this.saveItemOrders(itemMap, [
      source.droppableId,
      destination.droppableId
    ]);
  };

  itemChange = (itemId: string, destinationStageId: string) => {
    const { options } = this.props;

    client
      .mutate({
        mutation: gql(options.mutations.changeMutation),
        variables: {
          _id: itemId,
          destinationStageId
        }
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  saveStageOrders = (stageIds: string[]) => {
    client
      .mutate({
        mutation: gql(mutations.stagesUpdateOrder),
        variables: {
          orders: stageIds.map((stageId, index) => ({
            _id: stageId,
            order: index
          }))
        }
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  saveItemOrders = (itemMap: IItemMap, stageIds: string[]) => {
    const { options, queryParams } = this.props;

    for (const stageId of stageIds) {
      const orders = collectOrders(itemMap[stageId]);

      client
        .mutate({
          mutation: gql(options.mutations.updateOrderMutation),
          variables: {
            orders,
            stageId
          },
          refetchQueries: [
            {
              query: gql(queries.stageDetail),
              variables: {
                _id: stageId,
                search: queryParams.search,
                customerIds: queryParams.customerIds,
                companyIds: queryParams.companyIds,
                assignedUserIds: queryParams.assignedUserIds,
                extraParams: options.getExtraParams(queryParams),
                closeDateType: queryParams.closeDateType,
                userIds: queryParams.userIds
              }
            }
          ]
        })
        .catch((e: Error) => {
          Alert.error(e.message);
        });
    }
  };

  /*
   * - Stage container is sending loaded to items
   * - Storing sent items to global itemsMap
   * - Mark stage's task as complete
   * - Mark stage's loading state as loaded
   */
  onLoadStage = (stageId: string, items: IItem[]) => {
    const { itemMap, stageLoadMap } = this.state;
    const task = PipelineProvider.tasks.find(t => t.stageId === stageId);

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
    let currentTask = PipelineProvider.currentTask;

    PipelineProvider.tasks.push({
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
    const inCompleteTask = PipelineProvider.tasks.find(
      (task: Task) => !task.isComplete
    );

    while (
      (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
      inCompleteTask
    ) {
      const { handler, stageId } = inCompleteTask;
      handler(stageId);
    }

    PipelineProvider.currentTask = null;

    if (inCompleteTask) {
      PipelineProvider.currentTask = requestIdleCallback(this.runTaskQueue);
    }
  };

  onAddItem = (stageId: string, item: IItem) => {
    const { itemMap } = this.state;
    const items = itemMap[stageId];

    this.setState({
      itemMap: { ...itemMap, [stageId]: [...items, item] }
    });
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

    // Moved between stages
    if (prevStageId && stageId !== prevStageId) {
      // remove from old stage
      const prevStageItems = itemMap[prevStageId].filter(
        (d: IItem) => d._id !== item._id
      );

      // add to new stage's front
      const items = [...itemMap[stageId]];
      items.unshift(item);

      const newitemMap = {
        ...itemMap,
        [stageId]: items,
        [prevStageId]: prevStageItems
      };

      this.setState({ itemMap: newitemMap }, () => {
        this.saveItemOrders(newitemMap, [stageId]);
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
    const { itemMap, stageLoadMap, stageIds, isShowLabel } = this.state;

    return (
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
    );
  }
}
