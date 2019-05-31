import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { ChannelForm } from '../components';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  members: IUser[];
  save: (
    params: {
      doc: {
        name: string;
        description: string;
        memberIds: string[];
      };
    },
    callback: () => void,
    channel?: IChannel
  ) => void;
  closeModal: () => void;
  loading?: boolean;
};

const ChannelFormContainer = (props: Props) => {
  const { channel, save, members } = props;

  let selectedMembers: string[] = [];

  if (channel) {
    selectedMembers = members
      .filter(user => channel.memberIds.includes(user._id))
      .map(user => user._id);
  }

  const updatedProps = {
    ...props,
    channel,
    save,
    selectedMembers
  };

  return <ChannelForm {...updatedProps} />;
};

export default ChannelFormContainer;
