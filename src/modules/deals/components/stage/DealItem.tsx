import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import { EditForm } from 'modules/deals/containers/editForm';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as moment from 'moment';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

type Props = {
  stageId: string;
  deal: IDeal;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, deal: IDeal) => void;
  onRemove: (_id: string, stageId: string) => void;
  onUpdate: (deal: IDeal) => void;
};

const Container = styled.div`
  overflow: auto;
`;

const Right = styled.div`
  float: right;
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

const Deal = styledTS<{ isDragging: boolean }>(styled.div)`
  margin-bottom: 10px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  overflow: hidden;
  padding: 10px;
  outline: 0px;
  border-radius: 3px;
  transition: box-shadow 0.3s ease-in-out 0s;
  -webkit-box-pack: justify;
  justify-content: space-between;
`;

const Date = styledTS<{ fontSize?: number }>(styled.span)`
  color: rgb(136, 136, 136);
  font-size: ${({ fontSize }) => `${fontSize || 11}px`};
  z-index: 10;
  cursor: help;
  margin-left: 5px;
  flex-shrink: 0;
`;

const Indicator = styledTS<{ color: string }>(styled.span)`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 8px 8px 0 0;
  background-color: ${props => props.color}
`;

const Footer = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #ccc;
`;

export default class DealItem extends React.PureComponent<
  Props,
  { isFormVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { isFormVisible: false };
  }

  renderDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null;

    return <Date>{moment(date).fromNow()}</Date>;
  }

  toggleForm = () => {
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
        <Modal.Header closeButton>
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
          <p>{deal.name}</p>

          {products.map((product, index) => (
            <div key={index}>
              <Indicator color="#63D2D6" />
              {product.name}
            </div>
          ))}

          {customers.map((customer, index) => (
            <div key={index}>
              <Indicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <Indicator color="#CEF753" />
              {company.primaryName}
            </div>
          ))}

          <br />

          <Container>
            {renderDealAmount(deal.amount)}

            <Right>
              {(deal.assignedUsers || []).map((user, index) => (
                <img
                  key={index}
                  src={user.details && user.details.avatar}
                  width="24px"
                  height="24px"
                  style={{ marginLeft: '2px' }}
                />
              ))}
            </Right>
          </Container>

          <Footer>
            <Container>
              {__('Last updated')}

              <Right>{this.renderDate(deal.modifiedAt)}</Right>
            </Container>
          </Footer>
        </Content>
        {this.renderForm()}
      </Deal>
    );
  }
}
