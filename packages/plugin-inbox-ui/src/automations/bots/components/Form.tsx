import {
  Content,
  MessengerPreview
} from "@erxes/ui-inbox/src/settings/integrations/styles";
import Steps from "@erxes/ui/src/components//step/Steps";
import Button from "@erxes/ui/src/components/Button";
import HelpPopover from "@erxes/ui/src/components/HelpPopover";
import BreadCrumb from "@erxes/ui/src/components/breadcrumb/BreadCrumb";
import FormControl from "@erxes/ui/src/components/form/Control";
import CommonForm from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Step from "@erxes/ui/src/components/step/Step";
import { Preview, StepWrapper } from "@erxes/ui/src/components/step/styles";
import { PageHeader } from "@erxes/ui/src/layout/styles";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useEffect, useState } from "react";
import Accounts from "../../../../src/settings/integrations/containers/messenger/AddOns";
import ButtonsGenerator from "../../components/action/ButtonGenerator";
import { Container, FieldInfo, Padding } from "../../styles";
import { EmulatorWrapper, Features, MobileEmulator } from "../styles";
import { SelectAccountPages, fetchPageDetail } from "../utils";
import { Avatar } from "@erxes/ui-sales/src/boards/styles/item";
import Icon from "@erxes/ui/src/components/Icon";
// import { FacebookTagText } from "../../../components/conversationDetail/workarea/styles";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import { Toggle } from "@erxes/ui/src/components";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui-inbox/src/settings/integrations/graphql";
import { useQuery } from "@apollo/client";
const tags = [
  { label: "Confirmed Event Update", value: "CONFIRMED_EVENT_UPDATE" },
  { label: "Post-Purchase Update", value: "POST_PURCHASE_UPDATE" },
  { label: "Account Update", value: "ACCOUNT_UPDATE" }
];
import Spinner from "@erxes/ui/src/components/Spinner";
import Select from "react-select";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  bot?: any;
  returnToList: () => void;
};

function removeNullAndTypename(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullAndTypename);
  }

  const cleanedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== null && key !== "__typename") {
      cleanedObj[key] = removeNullAndTypename(obj[key]);
    }
    if (key === "persistentMenus" && Array.isArray(obj[key])) {
      cleanedObj[key] = obj[key].map((item) => {
        const { isEditing, ...rest } = item;
        return removeNullAndTypename(rest);
      });
    }
  }

  return cleanedObj;
}

function Form({ renderButton, bot, returnToList }: Props) {
  const [doc, setDoc] = useState(bot || {});
  const [selectedAccount, setAccount] = useState(null as any);
  const [isLastStep, setLastStep] = useState(false);

  const { loading, data, error } = useQuery(gql(queries.integrations), {
    variables: {
      kind: "messenger"
    }
  });

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  const generateDoc = (values) => {
    return { ...removeNullAndTypename(doc || {}), ...values };
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values, errors, registerChild } = formProps;

    const onSelect = (value, name) => {
      setDoc({ ...doc, [name]: value });
    };

    const onChange = (name, value) => {
      setDoc({ ...doc, [name]: value });
    };
    const handleSelectChange = (selectedOption) => {
      setDoc({ ...doc, integration: selectedOption });
    };
    // console.log(activeIntegrations, "activeIntegrations");

    const transformedData = data.integrations.map((integration) => ({
      value: integration._id, // Use _id as the value
      label: integration.name // Use name as the label to display
    }));
    console.log(values, "aksodpakopsd");
    return (
      <>
        <Step
          title='Select Integration'
          img='/images/icons/erxes-01.svg'
          onClick={() => setLastStep(false)}>
          <Padding>
            <h4>Select an Active Integration</h4>
            <Select
              options={transformedData}
              onChange={handleSelectChange}
              placeholder='Choose an integration'
            />
          </Padding>
        </Step>
        <Step
          title='Bot Setup'
          img='/images/icons/erxes-24.svg'
          noButton
          back={() => setLastStep(false)}
          onClick={() => setLastStep(true)}>
          <Padding>
            <FormGroup>
              <ControlLabel>{__("Name")}</ControlLabel>
              <p>{__("Name this bot to differentiate from the rest")}</p>
              <FormControl
                {...formProps}
                name='name'
                required
                defaultValue={doc?.name}
              />
            </FormGroup>
          </Padding>
        </Step>
        <ModalFooter>
          <Padding>
            <Button
              btnStyle='simple'
              onClick={returnToList}>
              {__("Cancel")}
            </Button>
            {renderButton({
              name: "Bot",
              values: generateDoc(values),
              isSubmitted,
              object: bot
            })}
          </Padding>
        </ModalFooter>
      </>
    );
  };

  // Pass mock values for errors and registerChild (or actual if needed)
  // const mockFormProps = {
  //   isSubmitted: false,
  //   values: {},
  //   errors: {}, // Provide an empty object if not used
  //   registerChild: () => {} // Provide a no-op function if not using it
  // };
  // console.log(mockFormProps, "asdopaskdopasopdkpaoskp");
  // return renderContent(mockFormProps);
}

export default Form;
