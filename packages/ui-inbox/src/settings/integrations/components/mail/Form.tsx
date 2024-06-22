import * as React from "react";
import * as routerUtils from "@erxes/ui/src/utils/router";

import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IExchangeForm, IImapForm, IntegrationTypes } from "../../types";

import Button from "@erxes/ui/src/components/Button";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Info from "@erxes/ui/src/components/Info";
import MailAuthForm from "./MailAuthForm";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import SelectBrand from "../../containers/SelectBrand";
import SelectChannels from "../../containers/SelectChannels";
import { __ } from "coreui/utils";
import { useLocation } from "react-router-dom";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  kind: IntegrationTypes;
  email?: string;
};

const Form = (props: Props) => {
  const [channelIds, setChannelIds] = React.useState<string[]>([]);
  const location = useLocation();

  const onChannelChange = (values: string[]) => {
    setChannelIds(values);
  };

  const generateDoc = (
    values: { name: string; brandId: string } & IImapForm & IExchangeForm
  ) => {
    const { kind } = props;
    const { name, brandId, ...args } = values;

    const uid = routerUtils.getParam(location, "uid");

    return {
      kind,
      name,
      brandId,
      channelIds: channelIds,
      data: {
        id: "requestId",
        uid,
        ...args,
      },
    };
  };

  const renderProvideForm = (formProps: IFormProps) => {
    const { kind } = props;
    return <MailAuthForm formProps={formProps} kind={kind} />;
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <Info>
            <strong>{__("Email add account description question")}</strong>
            <br />
            <p>{__("Email add account description")}</p>
            <p>
              <a
                target="_blank"
                href="https://erxes.io/help/knowledge-base/article/detail?catId=5o5ZRSi5c8NX3fbTA&_id=B7LseAvFdKsiLa3kG"
                rel="noopener noreferrer"
              >
                {__("Learn how to connect a Gmail using IMAP")}
              </a>
            </p>
          </Info>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            "Which specific Brand does this integration belong to?"
          )}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        {renderProvideForm(formProps)}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={props.closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          {props.renderButton({
            name: "integration",
            values: generateDoc(values),
            isSubmitted,
            callback: props.closeModal,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
