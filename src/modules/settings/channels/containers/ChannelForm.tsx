import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { ChannelForm } from '../components';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  members: IUser[];
  closeModal: () => void;
  loading?: boolean;
  refetchQueries: any;
};

const ChannelFormContainer = (props: Props) => {
  const { channel, members, refetchQueries } = props;

  let selectedMembers: string[] = [];

  if (channel) {
    selectedMembers = members
      .filter(user => channel.memberIds.includes(user._id))
      .map(user => user._id);
  }

  const updatedProps = {
    ...props,
    channel,
    selectedMembers,
    refetchQueries
  };

  return <ChannelForm {...updatedProps} />;
};

export default ChannelFormContainer;
