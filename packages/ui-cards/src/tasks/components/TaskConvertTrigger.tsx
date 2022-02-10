import ConvertTrigger from '../../boards/components/portable/ConvertTrigger';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import options from '../../tasks/options';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  sourceConversationId?: string;
  url?: string;
  subject?: string;
  refetch: () => void;
  description?: string;
  attachments?: any[];
};

export default (props: Props) => {
  const title = props.url ? __('Go to a task') : __('Convert to a task');

  const extendedProps = {
    ...props,
    options,
    title
  };

  return <ConvertTrigger {...extendedProps} />;
};
