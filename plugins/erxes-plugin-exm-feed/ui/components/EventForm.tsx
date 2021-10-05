import React, { useState } from "react";
import { Form, Uploader, SelectTeamMembers } from "erxes-ui";
import { IFormProps, IButtonMutateProps } from "erxes-ui/lib/types";
import { UploadItems } from "../styles";
import { title, description } from "../utils";
import ControlLabel from "modules/common/components/form/Label";

type Props = {
  item?: any;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => any;
};

export default function EventForm(props: Props) {
  const { item = {} } = props;

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [recipientIds, setRecipientIds] = useState(item.recipientIds || []);

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <SelectTeamMembers
          label="Guests"
          name="recipientIds"
          initialValue={recipientIds}
          onSelect={setRecipientIds}
        />
        {title(formProps, item)}
        {description(formProps, item)}
        <UploadItems>
          <div>
            <Uploader
              defaultFileList={attachments || []}
              onChange={setAttachment}
            />
            <ControlLabel>Add attachments:</ControlLabel>
          </div>
        </UploadItems>
        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: "event",
            attachments,
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
