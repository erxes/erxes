import { Button, DropdownToggle, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Board } from '../containers';

type Props = {
  currentBoard: any,
  boards: any,
  pipelines?: any,
  onDragEnd?: any,
  states?: any,
  loading?: boolean
};

class Home extends React.Component<Props> {
  renderBoards() {
    const { currentBoard, boards } = this.props;

    if (boards.length === 1) {
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

export default Home;
