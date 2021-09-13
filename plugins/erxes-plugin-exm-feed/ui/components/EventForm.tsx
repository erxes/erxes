import React, { useState } from 'react';
import { Form, FormControl, Uploader, SelectTeamMembers } from 'erxes-ui';
import { IFormProps, IButtonMutateProps } from 'erxes-ui/lib/types';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
};

export default function BravoForm(props: Props) {
  const { item = {} } = props;

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [recipientIds, setRecipientIds] = useState(item.recipientIds || []);

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <SelectTeamMembers
          label='Guests'
          name='recipientIds'
          initialValue={recipientIds}
          onSelect={setRecipientIds}
        />

        <FormControl
          {...formProps}
          placeholder='Title'
          type='text'
          name='title'
          required={true}
          defaultValue={item.title}
        />

        <FormControl
          {...formProps}
          placeholder='Description'
          componentClass='textarea'
          name='description'
          defaultValue={item.description}
        />

        <div>
          <div>Add attachments: </div>
          <Uploader
            defaultFileList={attachments || []}
            onChange={setAttachment}
          />
        </div>

        <br />

        {renderButton({
          values: {
            ...values,
            contentType: 'event',
            attachments,
            recipientIds
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
