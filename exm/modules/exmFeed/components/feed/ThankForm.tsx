import { IButtonMutateProps, IFormProps, IOption } from "../../../common/types";
import React, { useState } from "react";
import { description, getUserOptions } from "../../utils";

import { Form } from "../../../common/form";
import { IUser } from "../../../auth/types";
import Select from "react-select-plus";
import withTeamMembers from "../../containers/withTeamMembers";

type Props = {
  item?: any;
  queryParams?: any;
  renderButton: (props: IButtonMutateProps) => any;
  closeModal?: () => void;
};

function ThankForm(props: Props & { users: IUser[] }) {
  const { item = {}, users } = props;

  const [recipientIds, setRecipientIds] = useState(item.recipientIds || []);

  const onSelectReciepent = (options: IOption[]) => {
    setRecipientIds(options.map((option) => option.value));
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <Select
          placeholder="Choose team members"
          name="recipientIds"
          value={recipientIds}
          onChange={onSelectReciepent}
          multi={true}
          options={getUserOptions(users)}
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

export default withTeamMembers(ThankForm);
