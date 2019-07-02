import { Chip, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { InstallCode } from 'modules/settings/integrations/components';
import { IMessengerApp } from 'modules/settings/integrations/types';
import React from 'react';

type Props = {
  messengerApps: IMessengerApp[];
  remove: (appId: string) => void;
};

class UserList extends React.PureComponent<Props, {}> {
  renderFrontContent(messenger: IMessengerApp) {
    const codeTrigger = (
      <div>
        <Tip text="Get install code">
          <Icon icon="layers" />
        </Tip>
      </div>
    );

    const content = props => <InstallCode {...props} integration={messenger} />;

    return (
      <ModalTrigger
        title="Install code"
        trigger={codeTrigger}
        content={content}
      />
    );
  }

  renderItems = () => {
    const { messengerApps, remove } = this.props;

    return messengerApps.map(messenger => (
      <Chip
        key={messenger._id}
        onClick={remove.bind(null, messenger._id)}
        frontContent={this.renderFrontContent(messenger)}
      >
        {messenger.name}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default UserList;
