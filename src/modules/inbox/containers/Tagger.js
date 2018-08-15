import React from 'react';
import { TaggerPopover } from 'modules/tags/components';
import { refetchSidebarConversationsOptions } from '../utils';

const Tagger = props => {
  const { refetchQueries } = refetchSidebarConversationsOptions();

  return (
    <TaggerPopover
      {...props}
      type="conversation"
      refetchQueries={refetchQueries}
    />
  );
};

export default Tagger;
