import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { Formgroup } from "@erxes/ui/src/components/form/styles";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __, Alert } from "@erxes/ui/src/utils";
import { WEBHOOK_DOC_URL } from "@erxes/ui/src/constants/integrations";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import CommonForm from "@erxes/ui-settings/src/common/components/Form";
import { ICommonFormProps } from "@erxes/ui-settings/src/common/types";
import { IWebhook } from "../types";
import { getWebhookActions } from "../utils";

type Props = {
  object?: IWebhook;
  webhookActions: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonFormProps;

const WebhookForm = (props: Props) => {
  const { object, webhookActions } = props;

  const [selectedActions, setSelectedActions] = useState<any[]>([]);

  useEffect(() => {
    const webhook = object || ({} as IWebhook);

    if (webhook.actions) {
      const actions =
        webhook.actions.map((item) => {
          return { label: item?.label, value: item?.label };
        }) || [];

      setSelectedActions(actions);
    }
  }, []);

  const handleSelect = (value) => {
    setSelectedActions(value);
  };

  const onChange = (e) => {
    const index = (e.currentTarget as HTMLInputElement).value;
    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    const selected = selectedActions[index];
    const newSelectedActions = selectedActions;

    newSelectedActions[index] = {
      type: selected.type,
      action: selected.action,
      label: selected.label,
      checked: isChecked,
    };

    setSelectedActions(newSelectedActions);
  };

  const collectValues = (selectedActions) => {
    return selectedActions.map(
      (selectedAction) =>
        getWebhookActions(webhookActions).find(
          (action) => action?.label === selectedAction?.label
        ) || {}
    );
  };

  const generateDoc = (values: { _id?: string; url: string }) => {
    const finalValues = values;

    if (!selectedActions) {
      return Alert.error("Choose action!");
    }

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      url: finalValues.url,
      actions: collectValues(selectedActions),
    };
  };

  const generateActions = () => {
    const actions = getWebhookActions(webhookActions);
    return actions
      .filter((a) => a)
      .map((action) => {
        return { label: action?.label, value: action?.label };
      });
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Endpoint url</ControlLabel>
          <FormControl
            {...formProps}
            name="url"
            defaultValue={object?.url || ""}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Actions</ControlLabel>
          <Select
            placeholder={__("Choose actions")}
            options={generateActions()}
            value={generateActions().find((o) => o.value === selectedActions)}
            onChange={handleSelect}
            isMulti={true}
          />
        </FormGroup>

        <Formgroup>
          <p>
            {__("For more information, please review the ")}
            <a target="_blank" rel="noopener noreferrer" href={WEBHOOK_DOC_URL}>
              documentaion.
            </a>
          </p>
        </Formgroup>
      </>
    );
  };

  return (
    <CommonForm
      {...props}
      name="Webhook"
      renderContent={renderContent}
      generateDoc={generateDoc}
      object={object}
    />
  );
};

export default WebhookForm;
