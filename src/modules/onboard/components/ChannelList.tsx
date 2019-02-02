import { Chip } from 'modules/common/components';
import { IChannel } from 'modules/settings/channels/types';
import * as React from 'react';

type Props = {
  channels: IChannel[];
  remove: (channelId: string) => void;
};

class ChannelList extends React.Component<Props, {}> {
  renderItems = () => {
    const { channels, remove } = this.props;

    return channels.map(channel => (
      <Chip key={channel._id} onClick={remove.bind(null, channel._id)}>
        {channel.name}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default ChannelList;
