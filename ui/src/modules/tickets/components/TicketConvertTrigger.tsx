import ConvertTrigger from 'modules/boards/components/portable/ConvertTrigger';
import React from 'react';
import { __ } from 'modules/common/utils';
import options from '../options';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  sourceConversationId?: string;
  url?: string;
  refetch: () => void;
  type?: string;
  description?: string;
  attachments?: any[];
};

export default (props: Props) => {
  const title = props.url ? __('Go to a ticket') : __('Convert to a ticket');

  const extendedProps = {
    ...props,
    options,
    title
  };

  return <ConvertTrigger {...extendedProps} />;
};
