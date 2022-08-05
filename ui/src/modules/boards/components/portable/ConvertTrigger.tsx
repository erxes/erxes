import AddForm from 'modules/boards/containers/portable/AddForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import { IOptions } from '../../types';

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
      <a target="_blank" rel="noopener noreferrer" href={url}>
        {title}
      </a>
    );
  }

  const trigger = <a href="#title">{title}</a>;

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
