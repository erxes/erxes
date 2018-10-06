import * as React from 'react';
import { ICommonState, IDragResult } from '../types';

interface IStore {
  move: (doc: IDragResult) => void;
  onDragEnd: (result: IDragResult) => void;
  states: ICommonState;
}

const DealContext = React.createContext({} as IStore);

export const DealConsumer = DealContext.Consumer;

export class DealProvider extends React.Component<{}, any> {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {};
  }

  move({ source, destination, itemId, type }: IDragResult) {
    this.setState({
      // remove from list
      [`${type}State${source._id}`]: {
        type: 'removeItem',
        index: source.index
      }
    });

    this.setState({
      // add to list
      [`${type}State${destination._id}`]: {
        type: 'addItem',
        index: destination.index,
        itemId
      }
    });
  }

  onDragEnd(result: IDragResult) {
    const { type, destination, source, draggableId } = result;

    // dropped outside the list
    if (!destination) return;

    this.move({
      source: { _id: source.droppableId, index: source.index },
      destination: { _id: destination.droppableId, index: destination.index },
      itemId: draggableId,
      type
    });
  }

  render() {
    return (
      <DealContext.Provider
        value={{
          move: this.move,
          onDragEnd: this.onDragEnd,
          states: this.state
        }}
      >
        {this.props.children}
      </DealContext.Provider>
    );
  }
}
