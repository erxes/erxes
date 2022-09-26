import { BoardItem } from '@erxes/ui-cards/src/settings/boards/styles';
import { Header } from '@erxes/ui-settings/src/styles';
import { ICalendar } from '../../types';
import { Link } from 'react-router-dom';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

type Props = {
  accountId?: string;
  calendars: ICalendar[];
};

class Calendars extends React.Component<Props, {}> {
  renderItems = () => {
    const { calendars, accountId } = this.props;

    return calendars.map(calendar => (
      <BoardItem key={calendar._id} isActive={calendar.accountId === accountId}>
        <Link to={`?accountId=${calendar.accountId}`}>{calendar.name}</Link>
      </BoardItem>
    ));
  };

  render() {
    return (
      <Sidebar wide={true} header={<Header>Calendars</Header>} full={true}>
        <List>{this.renderItems()}</List>
      </Sidebar>
    );
  }
}

export default Calendars;
