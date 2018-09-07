import * as React from 'react';
import PropTypes from 'prop-types';
import { ChannelForm } from '../components';

const ChannelFormContainer = props => {
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

ChannelFormContainer.propTypes = {
  channel: PropTypes.object,
  members: PropTypes.array,
  save: PropTypes.func,
  loading: PropTypes.bool
};

export default ChannelFormContainer;
