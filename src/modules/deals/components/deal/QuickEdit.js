import React from 'react';
import PropTypes from 'prop-types';
import { DealForm } from '../../containers';
import { Button } from 'modules/common/components';
import {
  DealMoveFormContainer,
  QuickEditContainer,
  RightControls
} from '../../styles';
import { DealMoveForm } from '../../containers';

const propTypes = {
  top: PropTypes.number,
  bottom: PropTypes.number,
  left: PropTypes.number,
  close: PropTypes.func,
  copy: PropTypes.func,
  remove: PropTypes.func,
  refetch: PropTypes.func,
  deal: PropTypes.object,
  saveDeal: PropTypes.func
};

class QuickEdit extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMove = this.toggleMove.bind(this);
    this.copy = this.copy.bind(this);
    this.remove = this.remove.bind(this);

    this.state = {
      showMove: false
    };
  }

  toggleMove() {
    this.setState({
      showMove: !this.state.showMove
    });
  }

  copy() {
    const deal = this.props.deal;

    const productIds = [];
    deal.products.forEach(el => {
      productIds.push(el._id);
    });

    const assignedUserIds = [];
    deal.assignedUsers.forEach(el => {
      assignedUserIds.push(el._id);
    });

    // copied doc
    const doc = {
      stageId: deal.stageId,
      pipelineId: deal.pipelineId,
      boardId: deal.boardId,
      closeDate: deal.closeDate,
      note: deal.note,
      productIds,
      assignedUserIds,
      companyId: deal.company._id,
      customerId: deal.customer._id,
      productsData: deal.productsData
    };

    this.props.copy(doc, () => {
      this.props.refetch();
      this.props.close();
    });
  }

  remove() {
    const deal = this.props.deal;
    this.props.remove(deal._id, () => {
      this.props.refetch();
      this.props.close();
    });
  }

  render() {
    const { deal, refetch, top, bottom, left, close, saveDeal } = this.props;

    return (
      <QuickEditContainer top={top} bottom={bottom} left={left}>
        <div>
          <DealForm close={close} deal={deal} saveDeal={saveDeal} />
          <RightControls>
            <Button btnStyle="link" onClick={this.toggleMove}>
              Move
            </Button>
            <Button btnStyle="link" onClick={this.copy}>
              Copy
            </Button>
            <Button btnStyle="link" onClick={this.remove}>
              Delete
            </Button>
          </RightControls>
          {this.state.showMove ? (
            <DealMoveFormContainer>
              <DealMoveForm
                deal={deal}
                closeEditForm={close}
                close={this.toggleMove}
                refetch={refetch}
              />
            </DealMoveFormContainer>
          ) : null}
        </div>
      </QuickEditContainer>
    );
  }
}

QuickEdit.propTypes = propTypes;

export default QuickEdit;
