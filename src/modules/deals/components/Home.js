import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import { Button, DropdownToggle, Icon } from 'modules/common/components';
import { Board } from '../containers';

const propTypes = {
  currentBoard: PropTypes.object,
  boards: PropTypes.array,
  pipelines: PropTypes.array,
  onDragEnd: PropTypes.func,
  states: PropTypes.object,
  loading: PropTypes.bool
};

const defaultProps = {
  boards: []
};

class Home extends React.Component {
  renderBoards() {
    const { currentBoard, boards } = this.props;

    if (boards.length === 1) {
      const { __ } = this.context;

      return (
        <li>
          <Link to="/settings/deals">
            <Icon icon="add" /> {__('Create another board')}
          </Link>
        </li>
      );
    }

    return boards.map(board => {
      if (board._id !== currentBoard._id) {
        return (
          <li key={board._id}>
            <Link to={`/deals/board?id=${board._id}`}>{board.name}</Link>
          </li>
        );
      }

      return null;
    });
  }

  renderActionBar(currentBoard) {
    if (!currentBoard) return null;

    const { __ } = this.context;

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans>
              {currentBoard.name}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    const actionBarRight = (
      <Button btnStyle="success" icon="settings">
        <Link to="/settings/deals">{__('Manage Board & Pipeline')}</Link>
      </Button>
    );

    return (
      <Wrapper.ActionBar
        left={actionBarLeft}
        right={actionBarRight}
        background="transparent"
      />
    );
  }

  render() {
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Deal') }];

    const { currentBoard } = this.props;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar(currentBoard)}
        content={<Board currentBoard={currentBoard} />}
        transparent
      />
    );
  }
}

Home.propTypes = propTypes;
Home.defaultProps = defaultProps;
Home.contextTypes = {
  __: PropTypes.func
};

export default Home;
