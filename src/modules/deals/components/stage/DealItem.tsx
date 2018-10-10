import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import { EditForm } from 'modules/deals/containers/editForm';
import { ActionInfo, DealFooter, ItemList } from 'modules/deals/styles/deal';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as moment from 'moment';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Items, UserCounter } from '../portable';

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

const InlineBlock = styled.div`
  display: inline-block;
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

  &:hover {
    background-color: #eee;
  }

  background-color: ${({ isDragging }) =>
    isDragging ? colors.colorLightBlue : colors.colorLightBlue};
  box-shadow: ${({ isDragging }) =>
    isDragging ? `2px 2px 1px ${colors.colorLightBlue}` : 'none'};

`;

const Title = styled.h4`
  margin-top: 0px;
  font-weight: normal;
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.4;
`;

const Date = styledTS<{ fontSize?: number }>(styled.span)`
  color: rgb(136, 136, 136);
  font-size: ${({ fontSize }) => `${fontSize || 11}px`};
  z-index: 10;
  cursor: help;
  margin-left: 5px;
  flex-shrink: 0;
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

    return (
      <Deal
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <div onClick={this.toggleForm}>
          <Title>{deal.name}</Title>
          <div>
            <ItemList>
              <Items color="#63D2D6" items={products} />
            </ItemList>
            <ItemList>
              <Items color="#F7CE53" items={deal.customers || []} />
            </ItemList>
            <ItemList>
              <Items color="#F7CE53" uppercase items={deal.companies || []} />
            </ItemList>
          </div>
          <Container>
            {renderDealAmount(deal.amount)}
            <Right>
              <UserCounter users={deal.assignedUsers || []} />
            </Right>
          </Container>
          <DealFooter>
            <Container>
              <span>{__('Last updated')}:</span>
              <Right>{this.renderDate(deal.modifiedAt, 'lll')}</Right>
            </Container>
          </DealFooter>
        </div>
        {this.renderForm()}
      </Deal>
    );
  }
}
