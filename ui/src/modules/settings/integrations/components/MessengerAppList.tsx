import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Label from 'modules/common/components/Label';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { INTEGRATIONS_COLORS } from '../integrationColors';
import { IMessengerApp } from '../types';

type Props = {
  messengerApps: IMessengerApp[];
  remove: (app: IMessengerApp) => void;
};

class MessengerAppList extends React.Component<Props> {
  renderRemoveAction(app) {
    const { remove } = this.props;

    if (!remove) {
      return null;
    }

    const onClick = () => remove(app);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  renderRow(app) {
    return (
      <tr key={app._id}>
        <td>{app.name}</td>
        <td>
          <Label lblColor={INTEGRATIONS_COLORS[app.kind]}>{app.kind}</Label>
        </td>
        <td>
          <ActionButtons>{this.renderRemoveAction(app)}</ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { messengerApps } = this.props;

    if (!messengerApps || messengerApps.length < 1) {
      return (
        <EmptyState
          text="There aren’t any integrations at the moment."
          image="/images/actions/2.svg"
        />
      );
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Kind')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{messengerApps.map(app => this.renderRow(app))}</tbody>
      </Table>
    );
  }
}

export default MessengerAppList;
