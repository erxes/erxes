import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __, getUserAvatar } from 'modules/common/utils';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { CloseModal, ScoreAmount } from '../styles';
import { IGrowthHack } from '../types';
import Score from './Score';

type Props = {
  stageId: string;
  item: IGrowthHack;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, item: IGrowthHack) => void;
  onRemove: (dealId: string, stageId: string) => void;
  onUpdate: (item: IGrowthHack) => void;
  onTogglePopup: () => void;
  options: IOptions;
};

export default class GrowthHackItem extends React.PureComponent<
  Props,
  { isFormVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { isFormVisible: false };
  }

  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  toggleForm = () => {
    this.props.onTogglePopup();

    const { isFormVisible } = this.state;

    this.setState({ isFormVisible: !isFormVisible });
  };

  renderForm = () => {
    const { stageId, item, onAdd, onRemove, onUpdate, options } = this.props;
    const { isFormVisible } = this.state;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal
        dialogClassName="modal-1000w"
        show={isFormVisible}
        onHide={this.toggleForm}
        enforceFocus={false}
      >
        <CloseModal onClick={this.toggleForm}>
          <Icon icon="times" />
        </CloseModal>
        <Modal.Body>
          <EditForm
            options={options}
            stageId={stageId}
            itemId={item._id}
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
    const { item, isDragging, provided } = this.props;
    const {
      customers,
      companies,
      scoringType,
      reach = 0,
      impact = 0,
      confidence = 0,
      ease = 0
    } = item;

    return (
      <ItemContainer
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={this.toggleForm}>
          <h5>
            {renderPriority(item.priority)}
            {item.name}
          </h5>
          <ScoreAmount>
            <Score.Amount
              type={scoringType}
              r={reach}
              i={impact}
              c={confidence}
              e={ease}
            />
          </ScoreAmount>

          {customers.map((customer, index) => (
            <div key={index}>
              <ItemIndicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <ItemIndicator color="#EA475D" />
              {company.primaryName}
            </div>
          ))}

          <PriceContainer>
            <Right>
              {(item.assignedUsers || []).map((user, index) => (
                <img
                  alt="Avatar"
                  key={index}
                  src={getUserAvatar(user)}
                  width="22px"
                  height="22px"
                  style={{ marginLeft: '2px', borderRadius: '11px' }}
                />
              ))}
            </Right>
          </PriceContainer>

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </ItemContainer>
    );
  }
}
