import { Item } from 'modules/boards/types';
import { __, getUserAvatar } from 'modules/common/utils';
import { EditForm } from 'modules/deals/containers/editForm';
import {
  Deal,
  DealDate,
  Footer,
  PriceContainer,
  Right
} from 'modules/deals/styles/deal';
import { Content, DealIndicator } from 'modules/deals/styles/stage';
import { renderDealAmount } from 'modules/deals/utils';
import * as moment from 'moment';
import * as React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  stageId: string;
  item: Item;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, item: Item) => void;
  onRemove: (dealId: string, stageId: string) => void;
  onUpdate: (item: Item) => void;
  onTogglePopup: () => void;
};

export default class DealItem extends React.PureComponent<
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

    return <DealDate>{moment(date).format('MMM D, h:mm a')}</DealDate>;
  }

  toggleForm = () => {
    this.props.onTogglePopup();

    const { isFormVisible } = this.state;

    this.setState({ isFormVisible: !isFormVisible });
  };

  renderForm = () => {
    const { stageId, item, onAdd, onRemove, onUpdate } = this.props;
    const { isFormVisible } = this.state;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal bsSize="lg" show={true} onHide={this.toggleForm}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Edit deal')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditForm
            stageId={stageId}
            dealId={item._id}
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
    const products = (item.products || []).map(p => p.product);
    const { customers, companies } = item;

    return (
      <Deal
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={this.toggleForm}>
          <h5>{item.name}</h5>

          {products.map((product, index) => (
            <div key={index}>
              <DealIndicator color="#63D2D6" />
              {product.name}
            </div>
          ))}

          {customers.map((customer, index) => (
            <div key={index}>
              <DealIndicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <DealIndicator color="#EA475D" />
              {company.primaryName}
            </div>
          ))}

          <PriceContainer>
            {renderDealAmount(item.amount)}

            <Right>
              {(item.assignedUsers || []).map((user, index) => (
                <img
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
      </Deal>
    );
  }
}
