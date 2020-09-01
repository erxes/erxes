import ConvertTrigger from 'modules/boards/components/portable/ConvertTrigger';
import React from 'react';
import options from '../options';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  sourceConversationId?: string;
  url?: string;
  refetch: () => void;
  description?: string;
  attachments?: any[];
};

export default (props: Props) => {
  const title = props.url ? 'Go to a task' : 'Convert to a task';

  const extendedProps = {
    ...props,
    options,
    title
  };

  return <ConvertTrigger {...extendedProps} />;
};
