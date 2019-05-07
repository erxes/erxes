import { IUserDoc } from 'modules/auth/types';
import { __, getUserAvatar, readFile } from 'modules/common/utils';
import { EditForm } from 'modules/deals/containers/editForm';
import {
  Deal,
  DealDate,
  Footer,
  PriceContainer,
  Right
} from 'modules/deals/styles/deal';
import { Content, DealIndicator } from 'modules/deals/styles/stage';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as moment from 'moment';
import * as React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  stageId: string;
  deal: IDeal;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, deal: IDeal) => void;
  onRemove: (dealId: string, stageId: string) => void;
  onUpdate: (deal: IDeal) => void;
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
    const { stageId, deal, onAdd, onRemove, onUpdate } = this.props;
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
            dealId={deal._id}
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
    const products = (deal.products || []).map(p => p.product);
    const { customers, companies } = deal;

    return (
      <Deal
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={this.toggleForm}>
          <h5>{deal.name}</h5>

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
            {renderDealAmount(deal.amount)}

            <Right>
              {(deal.assignedUsers || []).map((user, index) => (
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
            <Right>{this.renderDate(deal.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </Deal>
    );
  }
}
