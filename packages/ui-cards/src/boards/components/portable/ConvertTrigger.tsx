import AddForm from '../../containers/portable/AddForm';
import Button from '@erxes/ui/src/components/Button';
import { IOptions } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  options: IOptions;
  refetch: () => void;
  sourceConversationId?: string;
  title: string;
  subject?: string;
  url?: string;
  type?: string;
  description?: string;
  attachments?: any[];
  bookingProductId?: string;
};

export default function ConvertTrigger(props: Props) {
  const {
    relType,
    relTypeIds,
    options,
    refetch,
    assignedUserIds,
    sourceConversationId,
    title,
    url,
    type,
    subject,
    description,
    attachments,
    bookingProductId
  } = props;

  if (url) {
    return (
      <a
        onClick={() => {
          window.open(url, '_blank');
        }}
      >
        {title}
      </a>
    );
  }

  const trigger = <a>{title}</a>;

  const content = formProps => (
    <AddForm
      options={options}
      {...formProps}
      type={type}
      description={description}
      attachments={attachments}
      refetch={refetch}
      relType={relType}
      relTypeIds={relTypeIds}
      mailSubject={subject}
      assignedUserIds={assignedUserIds}
      sourceConversationId={sourceConversationId}
      showSelect={true}
      bookingProductId={bookingProductId}
    />
  );

  return <ModalTrigger title={title} trigger={trigger} content={content} />;
}
