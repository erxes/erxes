import { Chip } from 'modules/common/components';
import { IMessengerApp } from 'modules/settings/integrations/types';
import * as React from 'react';

type Props = {
  messengerApps: IMessengerApp[];
  remove: (appId: string) => void;
};

class UserList extends React.PureComponent<Props, {}> {
  renderItems = () => {
    const { messengerApps, remove } = this.props;

    return messengerApps.map(messenger => (
      <Chip key={messenger._id} onClick={remove.bind(null, messenger._id)}>
        {messenger.name}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default UserList;
