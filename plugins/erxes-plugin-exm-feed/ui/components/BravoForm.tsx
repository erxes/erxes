import React, { useState } from 'react';
import Select from 'react-select-plus';
import { Form } from 'erxes-ui';
import { IFormProps, IButtonMutateProps, IOption } from 'erxes-ui/lib/types';
import Field from './Field';
import { title, description, getUserOptions } from '../utils';
import { IUser } from 'erxes-ui/lib/auth/types';
import withTeamMembers from '../containers/withTeamMembers';

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

  const onChangeCustomFields = (fieldId: string, value: any) => {
    let updatedCustomFieldsData = customFieldsData.filter(
      f => f.field !== fieldId
    );

    updatedCustomFieldsData.push({ field: fieldId, value });

    setCustomFieldsData(updatedCustomFieldsData);
  };

  const onChangeRecipient = (option: IOption) => {
    setRecipientId(option ? option.value : '');
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <Select
          placeholder='Choose one'
          name='recipientId'
          value={recipientId}
          onChange={onChangeRecipient}
          multi={false}
          options={getUserOptions(users)}
        />
        {fields.map((f, index) => (
          <Field
            key={index}
            customFieldsData={customFieldsData}
            field={f}
            onChange={onChangeCustomFields}
          />
        ))}
        {title(formProps, item)}
        {description(formProps, item)}
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
