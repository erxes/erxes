import { HeaderButton, HeaderLink } from 'modules/boards/styles/header';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { IBoard, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Controls = styled.div`
  padding: 0 20px;

  ${HeaderButton} {
    display: block;
    overflow: hidden;
  }

  .dropdown {
    margin-bottom: 10px;
  }

  .dropdown-menu {
    max-width: 250px;

    li > a {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const FlexRow = styled.div`
  display: flex;

  .dropdown {
    flex: 1;
  }
`;

type Props = {
  currentBoard?: IBoard;
  currentGroup?: IGroup;
  boards: IBoard[];
};

const calendarLink = '/calendar';

class BoardChooser extends React.Component<Props> {
  static defaultProps = {
    viewType: 'board',
    boardText: 'Board',
    groupText: 'Group'
  };

  renderBoards() {
    const { currentBoard, boards } = this.props;

    return boards.map(board => {
      let link = `${calendarLink}?id=${board._id}`;

      const { groups = [] } = board;

      if (groups.length > 0) {
        link = `${link}&groupId=${groups[0]._id}`;
      }

      return (
        <li
          key={board._id}
          className={`${currentBoard &&
            board._id === currentBoard._id &&
            'active'}`}
        >
          <Link to={link}>{board.name}</Link>
        </li>
      );
    });
  }

  renderGroups() {
    const { currentBoard, currentGroup } = this.props;

    const groups = currentBoard ? currentBoard.groups || [] : [];

    if (groups.length === 0 || !currentBoard) {
      return (
        <EmptyState
          icon="web-grid-alt"
          text="Create Calendar group first"
          size="small"
          extra={
            <Button btnStyle="warning" uppercase={false} size="small">
              <Link
                to={`/settings/calendars?boardId=${
                  currentBoard ? currentBoard._id : ''
                }`}
              >
                Create Group
              </Link>
            </Button>
          }
        />
      );
    }

    return groups.map(group => {
      return (
        <li
          key={group._id}
          className={`${currentGroup &&
            group._id === currentGroup._id &&
            'active'}`}
        >
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
    const { currentBoard, currentGroup } = this.props;

    return (
      <Controls>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            <HeaderButton hasBackground={true}>
              <Icon icon="web-section-alt" />
              {(currentBoard && currentBoard.name) || __('Choose board')}
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
        <FlexRow>
          <Dropdown>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-group">
              <HeaderButton hasBackground={true}>
                <Icon icon="window-grid" />
                {(currentGroup && currentGroup.name) || __('Choose group')}
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
        </FlexRow>
      </Controls>
    );
  }
}

export default BoardChooser;
