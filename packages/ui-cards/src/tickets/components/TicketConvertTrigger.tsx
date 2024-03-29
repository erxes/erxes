import ConvertTrigger from '../../boards/components/portable/ConvertTrigger';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import options from '../options';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  sourceConversationId?: string;
  url?: string;
  subject?: string;
  refetch: () => void;
  type?: string;
  description?: string;
  attachments?: any[];
};

export default function TicketConvertTrigger(props: Props) {
  const title = props.url ? __('Go to a ticket') : __('Convert to a ticket');

  const extendedProps = {
    ...props,
    options,
    title,
    autoOpenKey: 'showTicketConvertModal'
  };

  return <ConvertTrigger {...extendedProps} />;
}
