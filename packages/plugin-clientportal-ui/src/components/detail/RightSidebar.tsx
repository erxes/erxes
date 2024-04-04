import Box from '@erxes/ui/src/components/Box';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import { List } from '../../styles';
import { IClientPortalUser } from '../../types';
import options from '@erxes/ui-cards/src/tickets/options';
import CardItems from '../../containers/CardItems';

type Props = {
  clientPortalUser: IClientPortalUser;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    return (
      <Sidebar wide={true}>
        <Box title={__('Other')} name="showOthers">
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{dayjs(clientPortalUser.createdAt).format('lll')}</span>
            </li>
            <li>
              <div>{__('Modified at')}: </div>{' '}
              <span>{dayjs(clientPortalUser.modifiedAt).format('lll')}</span>
            </li>
          </List>
        </Box>

        <CardItems userId={clientPortalUser._id} type="ticket" />
        <CardItems userId={clientPortalUser._id} type="deal" />
        <CardItems userId={clientPortalUser._id} type="task" />
        <CardItems userId={clientPortalUser._id} type="purchase" />
      </Sidebar>
    );
  }
}
