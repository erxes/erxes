import React from 'react';
import { Table } from 'react-bootstrap';
import { List } from '../../common/components';
import { ChannelForm } from '../containers';
import Row from './Row';

class ChannelList extends List {
  constructor(props) {
    super(props);

    this.title = 'New channel';
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  renderContent() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings/channels' }, { title: 'Channels' }];
  }
}

export default ChannelList;
