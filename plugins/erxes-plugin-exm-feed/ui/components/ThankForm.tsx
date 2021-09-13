import React, { useState } from 'react';
import { Form, FormControl, SelectTeamMembers } from 'erxes-ui';
import { IFormProps, IButtonMutateProps } from 'erxes-ui/lib/types';
import ThankList from '../containers/ThankList';

type Props = {
  item?: any;
  queryParams?: any;
  renderButton: (props: IButtonMutateProps) => any;
  closeModal?: () => void;
};

export default function ThankForm(props: Props) {
  const { item = {} } = props;

  const [recipientIds, setRecipientIds] = useState(item.recipientIds || []);

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <SelectTeamMembers
          label="Receipts"
          name="recipientIds"
          initialValue={recipientIds}
          onSelect={setRecipientIds}
        />

        <FormControl
          {...formProps}
          placeholder="Description"
          componentClass="textarea"
          name="description"
          defaultValue={item.description}
          required={true}
        />

        <br />

        {renderButton({
          values: {
            ...values,
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
