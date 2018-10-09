import { __ } from 'modules/common/utils';
import { borderRadius, colors, grid } from 'modules/deals/constants';
import { EditForm } from 'modules/deals/containers/editForm';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  stageId: string;
  deal: IDeal;
  index: number;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, deal: IDeal) => void;
  onRemove: (_id: string, stageId: string) => void;
  onUpdate: (deal: IDeal) => void;
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
export default class DealItem extends React.PureComponent<
  Props,
  { isFormVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { isFormVisible: false };
  }

  renderAmount = amount => {
    if (Object.keys(amount).length === 0) return null;

    return (
      <span>
        {Object.keys(amount).map(key => (
          <li key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </li>
        ))}
      </span>
    );
  };

  toggleForm = () => {
    const { isFormVisible } = this.state;

    this.setState({ isFormVisible: !isFormVisible });
  };

  renderForm = () => {
    const { stageId, deal, onAdd, onRemove, onUpdate, index } = this.props;
    const { isFormVisible } = this.state;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal bsSize="lg" show={true} onHide={this.toggleForm}>
        <Modal.Header closeButton>
          <Modal.Title>{__('Edit deal')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditForm
            stageId={stageId}
            dealId={deal._id}
            index={index}
            onAdd={onAdd}
            onRemove={onRemove}
            onUpdate={onUpdate}
            closeModal={this.toggleForm}
          />
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const { deal, isDragging, provided } = this.props;

    return (
      <Container
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={this.toggleForm}>
          <div>{deal.name}</div>
          {this.renderAmount(deal.amount)}
          {(deal.assignedUsers || []).map((user, index) => (
            <span key={index}>{user.email}</span>
          ))}
          {deal.modifiedAt}
        </Content>

        {this.renderForm()}
      </Container>
    );
  }
}
