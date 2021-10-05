import React, { useState } from "react";
import { Form, SelectTeamMembers } from "erxes-ui";
import { IFormProps, IButtonMutateProps } from "erxes-ui/lib/types";
import { description } from "../utils";

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
          multi={false}
        />

        {description(formProps, item)}

        {renderButton({
          values: {
            description: values.description ? values.description : "Thank You",
            recipientIds,
          },
          isSubmitted,
          callback: closeModal,
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
