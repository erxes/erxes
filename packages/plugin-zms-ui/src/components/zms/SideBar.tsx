import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IZms } from '../../types';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';

type Props = {
  zmss: IZms[];
  id?: string;
};

type State = {
  zms?: IZms;
};

class SideBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { zms: undefined };
  }
  ListItem = (zms, currentTypeName) => {
    const className = zms && currentTypeName === zms._id ? 'active' : '';
    return (
      <SidebarListItem isActive={className === 'active'} key={zms._id}>
        <Link to={`/plugin-zms/zms?id=${zms._id}`}>
          {__(zms.customer.o_c_customer_information.o_c_registerno)}
        </Link>
      </SidebarListItem>
    );
  };
  render() {
    const { zmss, id } = this.props;
    return (
      <LeftSidebar hasBorder>
        <LeftSidebar.Header uppercase={true}>{__('ЗМС')}</LeftSidebar.Header>

        <SidebarList noTextColor noBackground id="SideBar">
          {zmss.map(zms => {
            return this.ListItem(zms, id);
          })}
        </SidebarList>
      </LeftSidebar>
    );
  }
}

export default SideBar;
