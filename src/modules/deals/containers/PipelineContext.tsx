import client from 'apolloClient';
import gql from 'graphql-tag';
import * as React from 'react';
import { mutations, queries } from '../graphql';
import { IDeal, IDealMap, IDragResult, IPipeline } from '../types';
import { collectOrders, reorder, reorderDealMap } from '../utils';

type Props = {
  pipeline: IPipeline;
  initialDealMap?: IDealMap;
};

type State = {
  dealMap: IDealMap;
  stageLoadMap: { [key: string]: boolean };
  stageIds: string[];
};

interface IStore {
  dealMap: IDealMap;
  stageLoadMap: { [key: string]: boolean };
  stageIds: string[];
  onLoadStage: (stageId: string, deals: IDeal[]) => void;
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

export class PipelineProvider extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { initialDealMap } = props;

    this.state = {
      dealMap: initialDealMap,
      stageLoadMap: {},
      stageIds: Object.keys(initialDealMap)
    };
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

  onLoadStage = (stageId: string, deals: IDeal[]) => {
    const { dealMap, stageLoadMap } = this.state;

    this.setState({
      dealMap: { ...dealMap, [stageId]: deals },
      stageLoadMap: { ...stageLoadMap, [stageId]: true }
    });
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

  onUpdateDeal = (deal, prevStageId) => {
    const { stageId } = deal;
    const { dealMap } = this.state;

    // Moved to anothor board or pipeline
    if (!dealMap[stageId] && prevStageId) {
      return this.onRemoveDeal(deal._id, prevStageId);
    }

    invalidateCalendarCache();

    const deals = [...dealMap[stageId]];

    const index = deals.findIndex(d => d._id === deal._id);

    deals[index] = deal;

    this.setState({
      dealMap: { ...dealMap, [stageId]: deals }
    });
  };

  render() {
    return (
      <PipelineContext.Provider
        value={{
          onDragEnd: this.onDragEnd,
          onLoadStage: this.onLoadStage,
          onAddDeal: this.onAddDeal,
          onRemoveDeal: this.onRemoveDeal,
          onUpdateDeal: this.onUpdateDeal,
          dealMap: this.state.dealMap,
          stageLoadMap: this.state.stageLoadMap,
          stageIds: this.state.stageIds
        }}
      >
        {this.props.children}
      </PipelineContext.Provider>
    );
  }
}
