import { IUser } from 'modules/auth/types';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { ChannelForm } from '../components';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  members: IUser[];
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading?: boolean;
};

const ChannelFormContainer = (props: Props) => {
  const { channel, members, renderButton } = props;

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
    renderButton
  };

  return <ChannelForm {...updatedProps} />;
};

export default ChannelFormContainer;
