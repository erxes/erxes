import React from 'react';
import PropTypes from 'prop-types';
import { DealForm } from '../../containers';
import { Button } from 'modules/common/components';
import { EditContainer, RightControls } from '../../styles/deal';
import { DealMoveForm } from '../../containers';

const propTypes = {
  close: PropTypes.func,
  saveDeal: PropTypes.func,
  removeDeal: PropTypes.func,
  moveDeal: PropTypes.func,
  deal: PropTypes.object
};

class DealEdit extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMove = this.toggleMove.bind(this);
    this.copy = this.copy.bind(this);

    this.state = { showMove: false };
  }

  toggleMove() {
    this.setState({ showMove: !this.state.showMove });
  }

  copy() {
    const { deal } = this.props;

    // copied doc
    const doc = {
      ...deal,
      assignedUserIds: deal.assignedUsers.map(user => user._id),
      companyIds: deal.companies.map(company => company._id),
      customerIds: deal.customers.map(customer => customer._id)
    };

    this.props.saveDeal(doc, () => this.props.close());
  }

  renderMoveForm(showMove) {
    if (!showMove) return null;

    const { deal, moveDeal } = this.props;
    const { boardId, pipelineId } = this.context;

    return (
      <DealMoveForm
        deal={deal}
        boardId={boardId}
        pipelineId={pipelineId}
        moveDeal={moveDeal}
        close={this.toggleMove}
      />
    );
  }

  render() {
    const { deal, close, saveDeal } = this.props;

    return (
      <EditContainer>
        <div>
          <DealForm saveDeal={saveDeal} deal={deal} />

          <RightControls>
            <Button onClick={this.toggleMove} icon="android-arrow-forward">
              Move
            </Button>

            <Button onClick={this.copy} icon="android-folder-open">
              Copy
            </Button>

            <Button
              icon="android-delete"
              onClick={() => this.props.removeDeal(this.props.deal._id)}
            >
              Delete
            </Button>

            <Button icon="android-close" onClick={close}>
              Close
            </Button>
          </RightControls>

          {this.renderMoveForm(this.state.showMove)}
        </div>
      </EditContainer>
    );
  }
}

DealEdit.propTypes = propTypes;
DealEdit.contextTypes = {
  boardId: PropTypes.string,
  pipelineId: PropTypes.string
};

export default DealEdit;
