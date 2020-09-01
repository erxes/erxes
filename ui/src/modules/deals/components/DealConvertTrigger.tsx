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
  const title = props.url ? 'Go to a deal' : 'Convert to a deal';

  const extendedProps = {
    ...props,
    options,
    title
  };

  return <ConvertTrigger {...extendedProps} />;
};
