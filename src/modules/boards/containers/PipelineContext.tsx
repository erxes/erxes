import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { requestIdleCallback } from 'request-idle-callback';
import { mutations, queries } from '../graphql';
import { IDragResult, IItemMap, IPipeline, Item } from '../types';
import { collectOrders, reorder, reorderItemMap } from '../utils';

type Props = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  queryParams: any;
  type: string;
};

type StageLoadMap = {
  [key: string]: 'readyToLoad' | 'loaded';
};

type State = {
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
};

interface IStore {
  type: string;
  itemMap: IItemMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  onLoadStage: (stageId: string, items: Item[]) => void;
  scheduleStage: (stageId: string) => void;
  onDragEnd: (result: IDragResult) => void;
  onAddItem: (stageId: string, item: Item) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  onUpdateItem: (item: Item, prevStageId?: string) => void;
}

const PipelineContext = React.createContext({} as IStore);

export const PipelineConsumer = PipelineContext.Consumer;

const invalidateCalendarCache = () => {
  localStorage.setItem('dealCalendarCacheInvalidated', 'true');
};

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
      stageIds: Object.keys(initialItemMap || {})
    };

    PipelineProvider.tasks = [];
    PipelineProvider.currentTask = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      queryParams: { search }
    } = this.props;

    const nextSearch = nextProps.queryParams.search;

    // Reset items on search parameter change
    if (search !== nextSearch) {
      const { stageIds } = this.state;

      PipelineProvider.tasks = [];
      PipelineProvider.currentTask = null;

      stageIds.forEach((stageId: string) => {
        this.scheduleStage(stageId);
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

    const itemId = result.draggableId;

    // update item to database
    this.itemChange(itemId);

    const item = itemMap[destination.droppableId].find(d => d._id === itemId);
    item.modifiedAt = new Date();

    this.setState({
      itemMap
    });

    // save orders to database
    return this.saveDealOrders(itemMap, [
      source.droppableId,
      destination.droppableId
    ]);
  };

  itemChange = (itemId: string) => {
    client
      .mutate({
        mutation: gql(mutations.dealsChange),
        variables: {
          _id: itemId
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

  saveDealOrders = (itemMap: IItemMap, stageIds: string[]) => {
    for (const stageId of stageIds) {
      const orders = collectOrders(itemMap[stageId]);

      if (orders.length === 0) {
        continue;
      }

      client
        .mutate({
          mutation: gql(mutations.updateOrder),
          variables: {
            orders,
            stageId
          },
          refetchQueries: [
            {
              query: gql(queries.stageDetail),
              variables: { _id: stageId }
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
   * - Storing sent items to global dealMmap
   * - Mark stage's task as complete
   * - Mark stage's loading state as loaded
   */
  onLoadStage = (stageId: string, items: Item[]) => {
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

  onAddItem = (stageId: string, item: Item) => {
    const { itemMap } = this.state;
    const items = itemMap[stageId];

    invalidateCalendarCache();

    this.setState({
      itemMap: { ...itemMap, [stageId]: [...items, item] }
    });
  };

  onRemoveItem = (itemId: string, stageId: string) => {
    const { itemMap } = this.state;

    const items = itemMap[stageId].filter(item => item._id !== itemId);

    invalidateCalendarCache();

    this.setState({
      itemMap: { ...itemMap, [stageId]: items }
    });
  };

  onUpdateItem = (item: Item, prevStageId?: string) => {
    invalidateCalendarCache();

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
        (d: Item) => d._id !== item._id
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
        this.saveDealOrders(newitemMap, [stageId]);
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

  render() {
    const { itemMap, stageLoadMap, stageIds } = this.state;

    return (
      <PipelineContext.Provider
        value={{
          type: this.props.type,
          onDragEnd: this.onDragEnd,
          onLoadStage: this.onLoadStage,
          scheduleStage: this.scheduleStage,
          onAddItem: this.onAddItem,
          onRemoveItem: this.onRemoveItem,
          onUpdateItem: this.onUpdateItem,
          itemMap,
          stageLoadMap,
          stageIds
        }}
      >
        {this.props.children}
      </PipelineContext.Provider>
    );
  }
}
