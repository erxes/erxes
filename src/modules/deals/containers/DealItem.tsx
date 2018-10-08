import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import CommonDeal from '../components/common/CommonDeal';
import { borderRadius, colors, grid } from '../constants';
import { IDeal } from '../types';

type Props = {
  deal: IDeal;
  isDragging: boolean;
  provided;
};

const Container = styledTS<{ isDragging: boolean }>(styled.a)`
  border-radius: ${borderRadius}px;
  border: 1px solid grey;
  background-color: ${({ isDragging }) =>
    isDragging ? colors.green : colors.white};
  box-shadow: ${({ isDragging }) =>
    isDragging ? `2px 2px 1px ${colors.shadow}` : 'none'};
  padding: ${grid}px;
  min-height: 40px;
  margin-bottom: ${grid}px;
  user-select: none;
  transition: background-color 0.1s ease;

  /* anchor overrides */
  color: ${colors.black};

  &:hover {
    color: ${colors.black};
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid ${colors.purple};
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  /* flex child */
  flex-grow: 1;

  /*
    Needed to wrap text in ie11
    https://stackoverflow.com/questions/35111090/why-ie11-doesnt-wrap-the-text-in-flexbox
  */
  flex-basis: 100%;

  /* flex parent */
  display: flex;
  flex-direction: column;
`;

// Previously this extended React.Component
// That was a good thing, because using React.PureComponent can hide
// issues with the selectors. However, moving it over does can considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent
export default class DealItem extends React.PureComponent<Props> {
  render() {
    const { deal, isDragging, provided } = this.props;

    return (
      <Container
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content>
          <CommonDeal deal={deal} />
        </Content>
      </Container>
    );
  }
}
