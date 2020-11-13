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
import { ICalendar, IGroup } from 'modules/settings/calendars/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';

type Props = {
  currentGroup?: IGroup;
  currentCalendar?: ICalendar;
  groups: IGroup[];
  groupText?: string;
  calendarText?: string;
};

const calendarLink = '/calendar';

class MainActionBar extends React.Component<Props> {
  static defaultProps = {
    viewType: 'group',
    groupText: 'Group',
    calendarText: 'Calendar'
  };

  renderGroups() {
    const { currentGroup, groups } = this.props;

    if ((currentGroup && groups.length === 1) || groups.length === 0) {
      return (
        <EmptyState icon="web-grid-alt" text="No other groups" size="small" />
      );
    }

    return groups.map(group => {
      if (currentGroup && group._id === currentGroup._id) {
        return null;
      }

      let link = `${calendarLink}?id=${group._id}`;

      const { calendars = [] } = group;

      if (calendars.length > 0) {
        link = `${link}&calendarId=${calendars[0]._id}`;
      }

      return (
        <li key={group._id}>
          <Link to={link}>{group.name}</Link>
        </li>
      );
    });
  }

  renderCalendars() {
    const { currentGroup, currentCalendar } = this.props;

    const calendars = currentGroup ? currentGroup.calendars || [] : [];

    if ((currentCalendar && calendars.length === 1) || calendars.length === 0) {
      return (
        <EmptyState
          icon="web-section-alt"
          text="No other calendar"
          size="small"
        />
      );
    }

    if (!currentGroup) {
      return null;
    }

    return calendars.map(calendar => {
      if (currentCalendar && calendar._id === currentCalendar._id) {
        return null;
      }

      return (
        <li key={calendar._id}>
          <Link
            to={`${calendarLink}?id=${currentGroup._id}&calendarId=${calendar._id}`}
          >
            {calendar.name}
          </Link>
        </li>
      );
    });
  }

  render() {
    const {
      currentGroup,
      currentCalendar,
      groupText,
      calendarText
    } = this.props;

    const actionBarLeft = (
      <BarItems>
        <HeaderLabel>
          <Icon icon="web-grid-alt" /> {__(groupText || '')}:{' '}
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
        <HeaderLabel>
          <Icon icon="web-section-alt" /> {__(calendarText || '')}:{' '}
        </HeaderLabel>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-calendar">
            <HeaderButton rightIconed={true}>
              {(currentCalendar && currentCalendar.name) ||
                __('Choose calendar')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderCalendars()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLink>
          <Tip text={__('Manage Group & Calendar')} placement="bottom">
            <Link
              to={`/settings/calendars?groupId=${
                currentGroup ? currentGroup._id : ''
              }`}
            >
              <Icon icon="cog" />
            </Link>
          </Tip>
        </HeaderLink>
      </BarItems>
    );

    return <PageHeader id="calendar-header">{actionBarLeft}</PageHeader>;
  }
}

export default MainActionBar;
