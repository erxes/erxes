import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius, colors, grid } from '../constants';
import DealList from './DealList';
import Title from './Title';

const Container = styled.div`
  margin: ${grid}px;
  display: flex;
  flex-direction: column;
`;

const Header = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${({ isDragging }) =>
    isDragging ? colors.blue.lighter : colors.blue.light};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${colors.blue.lighter};
  }
`;

type Props = {
  title: string;
  deals: any[];
  index: number;
};

export default class Column extends React.Component<Props> {
  render() {
    const title: string = this.props.title;
    const deals: any[] = this.props.deals;
    const index: number = this.props.index;
    return (
      <Draggable draggableId={title} index={index}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <Header isDragging={snapshot.isDragging}>
              <Title
                isDragging={snapshot.isDragging}
                {...provided.dragHandleProps}
              >
                {title}
              </Title>
            </Header>
            <DealList listId={title} listType="DEAL" deals={deals} />
          </Container>
        )}
      </Draggable>
    );
  }
}
