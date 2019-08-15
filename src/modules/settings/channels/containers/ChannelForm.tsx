import { IUser } from 'modules/auth/types';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import ChannelForm from '../components/ChannelForm';
import { IChannel } from '../types';

type Props = {
  channel?: IChannel;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading?: boolean;
};

const ChannelFormContainer = (props: Props) => {
  const { channel, renderButton } = props;

  let selectedMembers: string[] = [];

  if (channel) {
    selectedMembers = channel.members.map(member => member._id);
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
