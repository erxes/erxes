import client from 'apolloClient';
import gql from 'graphql-tag';
import * as React from 'react';
import { requestIdleCallback } from 'request-idle-callback';
import { mutations, queries } from '../graphql';
import { IDeal, IDealMap, IDragResult, IPipeline } from '../types';
import { collectOrders, reorder, reorderDealMap } from '../utils';

type Props = {
  pipeline: IPipeline;
  initialDealMap?: IDealMap;
  queryParams: any;
};

type StageLoadMap = {
  [key: string]: 'readyToLoad' | 'loaded';
};

type State = {
  dealMap: IDealMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
};

interface IStore {
  dealMap: IDealMap;
  stageLoadMap: StageLoadMap;
  stageIds: string[];
  onLoadStage: (stageId: string, deals: IDeal[]) => void;
  scheduleStage: (stageId: string) => void;
  onDragEnd: (result: IDragResult) => void;
  onAddDeal: (stageId: string, deal: IDeal) => void;
  onRemoveDeal: (dealId: string, stageId: string) => void;
  onUpdateDeal: (deal: IDeal, prevStageId?: string) => void;
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

    const { initialDealMap } = props;

    this.state = {
      dealMap: initialDealMap || {},
      stageLoadMap: {},
      stageIds: Object.keys(initialDealMap || {})
    };

    PipelineProvider.tasks = [];
    PipelineProvider.currentTask = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      queryParams: { search }
    } = this.props;

    const nextSearch = nextProps.queryParams.search;

    // Reset deals on search parameter change
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

    const { dealMap } = reorderDealMap({
      dealMap: this.state.dealMap,
      source,
      destination
    });

    this.setState({
      dealMap
    });

    // save orders to database
    return this.saveDealOrders(dealMap, [
      source.droppableId,
      destination.droppableId
    ]);
  };

  saveStageOrders = (stageIds: string[]) => {
    client.mutate({
      mutation: gql(mutations.stagesUpdateOrder),
      variables: {
        orders: stageIds.map((stageId, index) => ({
          _id: stageId,
          order: index
        }))
      }
    });
  };

  saveDealOrders = (dealMap: IDealMap, stageIds: string[]) => {
    for (const stageId of stageIds) {
      const orders = collectOrders(dealMap[stageId]);

      if (orders.length === 0) {
        continue;
      }

      client.mutate({
        mutation: gql(mutations.dealsUpdateOrder),
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
      });
    }
  };

  /*
   * - Stage container is sending loaded to deals
   * - Storing sent deals to global dealMmap
   * - Mark stage's task as complete
   * - Mark stage's loading state as loaded
   */
  onLoadStage = (stageId: string, deals: IDeal[]) => {
    const { dealMap, stageLoadMap } = this.state;
    const task = PipelineProvider.tasks.find(t => t.stageId === stageId);

    if (task) {
      task.isComplete = true;
    }

    this.setState({
      dealMap: { ...dealMap, [stageId]: deals },
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

  onAddDeal = (stageId: string, deal: IDeal) => {
    const { dealMap } = this.state;
    const deals = dealMap[stageId];

    invalidateCalendarCache();

    this.setState({
      dealMap: { ...dealMap, [stageId]: [...deals, deal] }
    });
  };

  onRemoveDeal = (dealId: string, stageId: string) => {
    const { dealMap } = this.state;

    const deals = dealMap[stageId].filter(deal => deal._id !== dealId);

    invalidateCalendarCache();

    this.setState({
      dealMap: { ...dealMap, [stageId]: deals }
    });
  };

  onUpdateDeal = (deal: IDeal, prevStageId?: string) => {
    invalidateCalendarCache();

    const { stageId } = deal;
    const { dealMap } = this.state;

    // Moved to anothor board or pipeline
    if (!dealMap[stageId] && prevStageId) {
      return this.onRemoveDeal(deal._id, prevStageId);
    }

    // Moved between stages
    if (prevStageId && stageId !== prevStageId) {
      // remove from old stage
      const prevStageDeals = dealMap[prevStageId].filter(
        (d: IDeal) => d._id !== deal._id
      );

      // add to new stage's front
      const deals = [...dealMap[stageId]];
      deals.unshift(deal);

      const newDealMap = {
        ...dealMap,
        [stageId]: deals,
        [prevStageId]: prevStageDeals
      };

      this.setState({ dealMap: newDealMap }, () => {
        this.saveDealOrders(newDealMap, [stageId]);
      });
    } else {
      const deals = [...dealMap[stageId]];
      const index = deals.findIndex(d => d._id === deal._id);

      deals[index] = deal;

      this.setState({
        dealMap: { ...dealMap, [stageId]: deals }
      });
    }
  };

  render() {
    const { dealMap, stageLoadMap, stageIds } = this.state;

    return (
      <PipelineContext.Provider
        value={{
          onDragEnd: this.onDragEnd,
          onLoadStage: this.onLoadStage,
          scheduleStage: this.scheduleStage,
          onAddDeal: this.onAddDeal,
          onRemoveDeal: this.onRemoveDeal,
          onUpdateDeal: this.onUpdateDeal,
          dealMap,
          stageLoadMap,
          stageIds
        }}
      >
        {this.props.children}
      </PipelineContext.Provider>
    );
  }
}
