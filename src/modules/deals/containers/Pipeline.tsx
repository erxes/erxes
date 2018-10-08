import { injectGlobal } from 'emotion';
import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { colors } from '../constants';
import { generateQuoteMap } from '../data';
import { queries } from '../graphql';
import reorder, { reorderQuoteMap } from '../reorder';
import { IDealMap, IPipeline, IStageMap } from '../types';
import Column from './Column';

const Container = styled('div')`
  min-height: 100vh;

  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  display: inline-flex;
`;

type Props = {};

type State = {
  columns;
  ordered: string[];
};

const initial = generateQuoteMap(500);

class WithStages extends React.Component<Props, State> {
  state: State = {
    columns: initial,
    ordered: Object.keys(initial)
  };

  componentDidMount() {
    injectGlobal`
      body {
        background: ${colors.blue.deep};
      }
    `;
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

const WithStatesQuery = props => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return null;
  }

  const stages = stagesQuery.dealStages;
  const dealMap: IDealMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    dealMap[stage._id] = stage.deals;
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} dealMap={dealMap} stageMap={stageMap} />;
};

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }: { pipeline: IPipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(WithStatesQuery);
