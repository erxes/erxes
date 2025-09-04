import React from 'react';
import { Icon, ModalTrigger } from '@erxes/ui/src';
import { IEmailTemplate } from '@erxes/ui-emailtemplates/src/types';
import { getContentType } from './utils';
import { SelectDocument } from './selectDocument';
import EmailTemplateForm from '@erxes/ui-emailtemplates/src/containers/Form';

type Props = {
  triggerType: string;
  template: IEmailTemplate;
  refetch: () => void;
};

export const EditEmailTemplateForm = ({
  triggerType,
  template,
  refetch
}: Props) => {
  const trigger = (
    <div>
      <Icon icon='edit' />
      Edit
    </div>
  );

  const content = ({ closeModal }) => {
    const updatedProps = {
      closeModal,
      contentType: getContentType(triggerType),
      additionalToolbarContent: SelectDocument({ triggerType }),
      object: template,
      contentTypeConfig: { usageType: 'automations' },
      refetch
    };

    return <EmailTemplateForm {...updatedProps} />;
  };

  return (
    <ModalTrigger
      title='Edit email template'
      content={content}
      trigger={trigger}
      size='lg'
    />
  );
};
