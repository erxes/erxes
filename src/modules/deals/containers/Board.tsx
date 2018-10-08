import { injectGlobal } from 'emotion';
import * as React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../constants';
import { generateQuoteMap } from '../data';
import reorder, { reorderQuoteMap } from '../reorder';
import Column from './Column';

const ParentContainer = styledTS<any>(styled.div)`
  height: ${({ height }) => height};
  overflow-x: hidden;
  overflow-y: auto;
`;

const Container = styled('div')`
  min-height: 100vh;

  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  display: inline-flex;
`;

type Props = {
  containerHeight?: string;
};

type State = {
  columns;
  ordered: string[];
};

const initial = generateQuoteMap(500);

export default class Board extends React.Component<Props, State> {
  /* eslint-disable react/sort-comp */

  state: State = {
    columns: initial,
    ordered: Object.keys(initial)
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
    const { containerHeight } = this.props;

    const board = (
      <Droppable
        droppableId="board"
        type="COLUMN"
        direction="horizontal"
        ignoreContainerClipping={Boolean(containerHeight)}
      >
        {provided => (
          <Container innerRef={provided.innerRef} {...provided.droppableProps}>
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
    );

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {this.props.containerHeight ? (
          <ParentContainer height={containerHeight}>{board}</ParentContainer>
        ) : (
          board
        )}
      </DragDropContext>
    );
  }
}
