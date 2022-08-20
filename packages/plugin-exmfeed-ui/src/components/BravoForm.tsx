import React, { useState } from 'react';
import Select from 'react-select-plus';
import { Form } from '@erxes/ui/src/components/form';
import { IFormProps, IButtonMutateProps, IOption } from '@erxes/ui/src/types';
import { title, description, getUserOptions } from '../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import withTeamMembers from '../containers/withTeamMembers';
import GenerateFields from './GenerateFields';

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
  fields: any[];
};

function BravoForm(props: Props & { users: IUser[] }) {
  const { item = {}, fields, users } = props;

  const [recipientId, setRecipientId] = useState(
    item.recipientIds && item.recipientIds.length > 0
      ? item.recipientIds[0]
      : ''
  );
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );

  const onChangeRecipient = (option: IOption) => {
    setRecipientId(option ? option.value : '');
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <Select
          placeholder="Choose one"
          name="recipientId"
          value={recipientId}
          onChange={onChangeRecipient}
          multi={false}
          options={getUserOptions(users)}
        />

        {title(formProps, item)}

        {description(formProps, item)}

        <GenerateFields
          fields={fields}
          customFieldsData={customFieldsData}
          setCustomFieldsData={setCustomFieldsData}
        />

        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: 'bravo',
            recipientIds: [recipientId],
            customFieldsData
          },
          isSubmitted,
          callback: closeModal
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default withTeamMembers(BravoForm);
