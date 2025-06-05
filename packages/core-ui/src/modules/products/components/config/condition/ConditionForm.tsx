import { FormControl, FormGroup } from "@erxes/ui/src/components/form";
import {
  IButtonMutateProps,
  IFormProps,
  IAttachment
} from "@erxes/ui/src/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils";
import { IBundleCondition } from "@erxes/ui-products/src/types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: IBundleCondition;
  closeModal: () => void;
};

export default function ConditionForm(props: Props) {
  const { closeModal, renderButton, item } = props;
  const object = item || ({} as IBundleCondition);

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues.id = object._id;
    }

    return {
      ...finalValues,
      radius: Number(finalValues.radius)
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__("Title")}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={false}>{__("description")}</ControlLabel>
          <FormControl
            {...formProps}
            required={false}
            name="description"
            defaultValue={object.description}
            componentclass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Code")}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="code"
            defaultValue={object.code}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
