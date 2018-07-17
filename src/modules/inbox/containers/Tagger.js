import React from 'react';
import { TaggerPopover } from 'modules/common/components';
import { refetchSidebarConversationsOptions } from '../utils';

const Tagger = props => {
  const { refetchQueries } = refetchSidebarConversationsOptions();

  return <TaggerPopover {...props} refetchQueries={refetchQueries} />;
};

export default Tagger;
