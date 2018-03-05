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
  left: PropTypes.number,
  close: PropTypes.func,
  add: PropTypes.func,
  remove: PropTypes.func,
  refetch: PropTypes.func,
  deal: PropTypes.object
};

class QuickEdit extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.copy = this.copy.bind(this);
    this.remove = this.remove.bind(this);
    this.closeMove = this.closeMove.bind(this);

    this.state = {
      showMove: false
    };
  }

  move() {
    this.setState({
      showMove: true
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

    this.props.add(
      {
        doc
      },
      () => {
        this.props.refetch();
        this.props.close();
      }
    );
  }

  closeMove() {
    this.setState({
      showMove: false
    });
  }

  remove() {
    const deal = this.props.deal;
    this.props.remove(deal._id, () => {
      this.props.close();
      this.props.refetch();
    });
  }

  render() {
    const { deal, refetch, top, left, close } = this.props;

    return (
      <QuickEditContainer top={top} left={left}>
        <div>
          <DealForm close={close} deal={deal} refetch={refetch} />
          <RightControls>
            <Button btnStyle="link" onClick={this.move}>
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
                close={this.closeMove}
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
