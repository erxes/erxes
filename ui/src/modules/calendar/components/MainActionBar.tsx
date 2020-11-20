import {
  HeaderButton,
  HeaderLabel,
  HeaderLink,
  PageHeader
} from 'modules/boards/styles/header';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { BarItems } from 'modules/layout/styles';
import { IBoard, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';

type Props = {
  currentBoard?: IBoard;
  currentGroup?: IGroup;
  boards: IBoard[];
  boardText?: string;
  groupText?: string;
};

const calendarLink = '/calendar';

class MainActionBar extends React.Component<Props> {
  static defaultProps = {
    viewType: 'board',
    boardText: 'Board',
    groupText: 'Group'
  };

  renderBoards() {
    const { currentBoard, boards } = this.props;

    if ((currentBoard && boards.length === 1) || boards.length === 0) {
      return (
        <EmptyState icon="web-grid-alt" text="No other boards" size="small" />
      );
    }

    return boards.map(board => {
      if (currentBoard && board._id === currentBoard._id) {
        return null;
      }

      let link = `${calendarLink}?id=${board._id}`;

      const { groups = [] } = board;

      if (groups.length > 0) {
        link = `${link}&groupId=${groups[0]._id}`;
      }

      return (
        <li key={board._id}>
          <Link to={link}>{board.name}</Link>
        </li>
      );
    });
  }

  renderGroups() {
    const { currentBoard, currentGroup } = this.props;

    const groups = currentBoard ? currentBoard.groups || [] : [];

    if ((currentGroup && groups.length === 1) || groups.length === 0) {
      return (
        <EmptyState icon="web-section-alt" text="No other group" size="small" />
      );
    }

    if (!currentBoard) {
      return null;
    }

    return groups.map(group => {
      if (currentGroup && group._id === currentGroup._id) {
        return null;
      }

      return (
        <li key={group._id}>
          <Link
            to={`${calendarLink}?id=${currentBoard._id}&groupId=${group._id}`}
          >
            {group.name}
          </Link>
        </li>
      );
    });
  }

  render() {
    const { currentBoard, currentGroup, boardText, groupText } = this.props;

    const actionBarLeft = (
      <BarItems>
        <HeaderLabel>
          <Icon icon="web-grid-alt" /> {__(boardText || '')}:{' '}
        </HeaderLabel>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            <HeaderButton rightIconed={true}>
              {(currentBoard && currentBoard.name) || __('Choose board')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLabel>
          <Icon icon="web-section-alt" /> {__(groupText || '')}:{' '}
        </HeaderLabel>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-group">
            <HeaderButton rightIconed={true}>
              {(currentGroup && currentGroup.name) || __('Choose group')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderGroups()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLink>
          <Tip text={__('Manage Board & Group')} placement="bottom">
            <Link
              to={`/settings/calendars?boardId=${
                currentBoard ? currentBoard._id : ''
              }`}
            >
              <Icon icon="cog" />
            </Link>
          </Tip>
        </HeaderLink>
      </BarItems>
    );

    return <PageHeader id="group-header">{actionBarLeft}</PageHeader>;
  }
}

export default MainActionBar;
