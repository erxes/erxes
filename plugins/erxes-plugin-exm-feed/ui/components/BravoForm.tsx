import React, { useState } from 'react';
import { Form, FormControl, SelectTeamMembers } from 'erxes-ui';
import { IFormProps, IButtonMutateProps } from 'erxes-ui/lib/types';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
};

export default function BravoForm(props: Props) {
  const { item = {} } = props;

  const [recipientId, setRecipientId] = useState(
    item.recipientIds && item.recipientIds.length > 0
      ? item.recipientIds[0]
      : []
  );

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <SelectTeamMembers
          label='Choose one'
          name='recipientId'
          multi={false}
          initialValue={recipientId}
          onSelect={setRecipientId}
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

        <br />

        {renderButton({
          values: {
            ...values,
            contentType: 'bravo',
            recipientIds: [recipientId]
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
