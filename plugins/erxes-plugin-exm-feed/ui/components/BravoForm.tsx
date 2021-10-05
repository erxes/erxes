import React, { useState } from "react";
import { Form, SelectTeamMembers } from "erxes-ui";
import { IFormProps, IButtonMutateProps } from "erxes-ui/lib/types";
import Field from "./Field";
import { title, description } from "../utils";

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
  fields: any[];
};

export default function BravoForm(props: Props) {
  const { item = {}, fields } = props;

  const [recipientId, setRecipientId] = useState(
    item.recipientIds && item.recipientIds.length > 0
      ? item.recipientIds[0]
      : []
  );
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );

  const onChangeCustomFields = (fieldId: string, value: any) => {
    let updatedCustomFieldsData = customFieldsData.filter(
      (f) => f.field !== fieldId
    );

    updatedCustomFieldsData.push({ field: fieldId, value });

    setCustomFieldsData(updatedCustomFieldsData);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <SelectTeamMembers
          label="Choose one"
          name="recipientId"
          initialValue={recipientId}
          onSelect={setRecipientId}
          multi={false}
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
            contentType: "bravo",
            recipientIds: [recipientId],
            customFieldsData,
          },
          isSubmitted,
          callback: closeModal,
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
