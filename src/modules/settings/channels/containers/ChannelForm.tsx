import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { ChannelForm } from '../components';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel,
  members: IUser[],
  save: ({ doc }: { doc: any }, callback: () => void, channel: IChannel) => void,
  loading?: boolean
};

const ChannelFormContainer = (props: Props) => {
  const { channel, save, members } = props;

  let selectedMembers = [];

  if (channel) {
    selectedMembers = members.filter(u => channel.memberIds.includes(u._id));
  }

  const updatedProps = {
    ...props,
    channel,
    members,
    save,
    selectedMembers
  };

  return <ChannelForm {...updatedProps} />;
};

export default ChannelFormContainer;
