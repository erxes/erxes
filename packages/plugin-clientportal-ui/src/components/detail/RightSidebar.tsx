import dayjs from 'dayjs';
import Box from '@erxes/ui/src/components/Box';
import { __ } from 'coreui/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

import React from 'react';
import { List } from '../../styles';
import { IClientPortalUser } from '../../types';

type Props = {
  clientPortalUser: IClientPortalUser;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    return (
      <Sidebar>
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
      </Sidebar>
    );
  }
}
