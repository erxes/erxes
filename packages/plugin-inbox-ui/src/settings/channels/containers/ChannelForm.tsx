import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ChannelForm from '@erxes/ui-settings/src/channels/components/ChannelForm';
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
