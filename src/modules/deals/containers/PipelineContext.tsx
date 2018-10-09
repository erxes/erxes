import * as React from 'react';
import { IDeal, IDealMap, IDragResult } from '../types';
import { reorder, reorderDealMap } from '../utils';

type Props = {
  initialDealMap: IDealMap;
};

type State = {
  dealMap: IDealMap;
  stageIds: string[];
};

interface IStore {
  dealMap: IDealMap;
  stageIds: string[];
  onDragEnd: (result: IDragResult) => void;
  onAddDeal: (stageId: string, deal: IDeal) => void;
  onRemoveDeal: (_id: string, stageId: string) => void;
}

const PipelineContext = React.createContext({} as IStore);

export const PipelineConsumer = PipelineContext.Consumer;

export class PipelineProvider extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { initialDealMap } = props;

    this.state = {
      dealMap: initialDealMap,
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

      return;
    }

    const data = reorderDealMap({
      dealMap: this.state.dealMap,
      source,
      destination
    });

    this.setState({
      dealMap: data.dealMap
    });
  };

  onAddDeal = (stageId: string, deal: IDeal) => {
    const { dealMap } = this.state;

    this.setState({
      dealMap: { ...dealMap, [stageId]: [...dealMap[stageId], deal] }
    });
  };

  onRemoveDeal = (_id: string, stageId: string) => {
    const { dealMap } = this.state;

    const deals = dealMap[stageId].filter(deal => deal._id !== _id);

    this.setState({
      dealMap: { ...dealMap, [stageId]: deals }
    });
  };

  render() {
    return (
      <PipelineContext.Provider
        value={{
          onDragEnd: this.onDragEnd,
          onAddDeal: this.onAddDeal,
          onRemoveDeal: this.onRemoveDeal,
          dealMap: this.state.dealMap,
          stageIds: this.state.stageIds
        }}
      >
        {this.props.children}
      </PipelineContext.Provider>
    );
  }
}
