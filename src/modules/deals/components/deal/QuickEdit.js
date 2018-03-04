import React from 'react';
import PropTypes from 'prop-types';
import { DealForm } from '../../containers';
import { Button } from 'modules/common/components';
import {
  DealMoveFormContainer,
  QuickEditDealFormContainer,
  RightControls
} from '../../styles';
import { DealMoveForm } from '../../containers';

const propTypes = {
  top: PropTypes.number,
  left: PropTypes.number,
  close: PropTypes.func,
  remove: PropTypes.func,
  refetch: PropTypes.func,
  deal: PropTypes.object
};

class QuickEditDealForm extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.closeMove = this.closeMove.bind(this);
    this.remove = this.remove.bind(this);

    this.state = {
      showMove: false
    };
  }

  move() {
    this.setState({
      showMove: true
    });
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
      <QuickEditDealFormContainer top={top} left={left}>
        <div>
          <DealForm close={close} deal={deal} refetch={refetch} />
          <RightControls>
            <Button btnStyle="link" onClick={this.move}>
              Move
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
      </QuickEditDealFormContainer>
    );
  }
}

QuickEditDealForm.propTypes = propTypes;

export default QuickEditDealForm;
