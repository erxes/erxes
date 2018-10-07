import { injectGlobal } from 'emotion';
import * as React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { colors } from '../constants';
import reorder, { reorderQuoteMap } from '../reorder';
import Column from './Column';

const Container = styled.div`
  min-height: 100vh;

  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  display: inline-flex;
`;

type Props = {
  initial;
};

type State = {
  columns;
  ordered: string[];
};

export default class Board extends React.Component<Props, State> {
  /* eslint-disable react/sort-comp */

  state: State = {
    columns: this.props.initial,
    ordered: Object.keys(this.props.initial)
  };

  boardRef?: HTMLElement;

  componentDidMount() {
    /* stylelint-disable max-empty-lines */
    // eslint-disable-next-line no-unused-expressions
    injectGlobal`
      body {
        background: ${colors.blue.deep};
      }
    `;
    /* stylelint-enable */
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

    // reordering column
    if (result.type === 'COLUMN') {
      const ordered: string[] = reorder(
        this.state.ordered,
        source.index,
        destination.index
      );

      this.setState({
        ordered
      });

      return;
    }

    const data = reorderQuoteMap({
      quoteMap: this.state.columns,
      source,
      destination
    });

    this.setState({
      columns: data.quoteMap
    });
  };

  render() {
    const columns = this.state.columns;
    const ordered: string[] = this.state.ordered;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable
          droppableId="board"
          type="COLUMN"
          direction="horizontal"
          ignoreContainerClipping={true}
        >
          {provided => (
            <Container
              innerRef={provided.innerRef}
              {...provided.droppableProps}
            >
              {ordered.map((key: string, index: number) => (
                <Column
                  key={key}
                  index={index}
                  title={key}
                  quotes={columns[key]}
                />
              ))}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
