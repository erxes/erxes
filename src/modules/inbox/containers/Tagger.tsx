import TaggerPopover from 'modules/tags/components/TaggerPopover';
import React from 'react';
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
