import { Container } from 'modules/deals/styles/deal';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius, colors, grid } from '../constants';
import { Amount } from '../styles/stage';
import { IDeal } from '../types';

type Props = {
  deal: IDeal;
  isDragging: boolean;
  provided;
};

const Content = styled('div')`
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
  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <Amount>
        {Object.keys(amount).map(key => (
          <li key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </li>
        ))}
      </Amount>
    );
  }

  render() {
    const { deal, isDragging, provided } = this.props;

    return (
      <Container
        href="#"
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content>
          <div>{deal.name}</div>
          {this.renderAmount(deal.amount)}
          {(deal.assignedUsers || []).map((user, index) => (
            <span key={index}>{user.email}</span>
          ))}
          {deal.modifiedAt}
        </Content>
      </Container>
    );
  }
}
