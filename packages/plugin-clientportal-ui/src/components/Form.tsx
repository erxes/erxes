import { ButtonWrap, Content } from "../styles";
import { ClientPortalConfig, MailConfig } from "../types";
import React, { useEffect, useState } from "react";
import { isEnabled, removeTypename } from "@erxes/ui/src/utils/core";

import { Alert } from "@erxes/ui/src/utils";
import Appearance from "./forms/Appearance";
import Button from "@erxes/ui/src/components/Button";
import { CONFIG_TYPES } from "../constants";
import Config from "./forms/Config";
import General from "../containers/General";

type Props = {
  configType: string;
  defaultConfigValues?: ClientPortalConfig;
  handleUpdate: (doc: ClientPortalConfig) => void;
};

const isUrl = (value: string): boolean => {
  try {
    return Boolean(new URL(value));
  } catch (e) {
    return false;
  }
};

const Form: React.FC<Props> = ({
  configType,
  defaultConfigValues,
  handleUpdate,
}: Props) => {
  const [formValues, setFormValues] = useState<ClientPortalConfig>(
    defaultConfigValues || ({} as ClientPortalConfig)
  );

  useEffect(() => {
    if (defaultConfigValues) {
      setFormValues(defaultConfigValues);
    }
  }, [defaultConfigValues]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formValues.name) {
      return Alert.error("Please enter a client portal name");
    }

    if (formValues.url && !isUrl(formValues.url)) {
      return Alert.error("Please enter a valid URL");
    }

    if (formValues.domain && !isUrl(formValues.domain)) {
      return Alert.error("Please enter a valid domain");
    }

    if (!formValues.knowledgeBaseTopicId && isEnabled("knowledgebase")) {
      return Alert.error("Please choose a Knowledge base topic");
    }

    if (formValues.styles) {
      formValues.styles = removeTypename(formValues.styles || ({} as any));
    }

    if (formValues.mailConfig) {
      const mailConfig: MailConfig =
        removeTypename(formValues.mailConfig) || {};

      if (!mailConfig.registrationContent.match(/{{ link }}/g)) {
        return Alert.error(
          "Please add {{ link }} to registration mail content to send verification link"
        );
      }

      if (!mailConfig.invitationContent.match(/{{ link }}|{{ password }}/g)) {
        return Alert.error(
          "Please add {{ link }} and {{ password }} to invitation mail content to send verification link and password"
        );
      }

      formValues.mailConfig = mailConfig;
    }

    if (formValues.otpConfig) {
      const { content } = formValues.otpConfig;

      if (!content.match(/{{ code }}/g)) {
        return Alert.error(
          "Please add {{ code }} to OTP content to send verification code"
        );
      }

      formValues.otpConfig = removeTypename(formValues.otpConfig);
    }
    if (formValues.twoFactorConfig) {
      const { content } = formValues.twoFactorConfig;

      if (!content.match(/{{ code }}/g)) {
        return Alert.error(
          "Please add {{ code }} to OTP content to send verification code"
        );
      }

      formValues.twoFactorConfig = removeTypename(formValues.twoFactorConfig);
    }
    if (
      formValues.manualVerificationConfig &&
      !formValues.manualVerificationConfig.userIds.length
    ) {
      return Alert.error("Please select at least one user who can verify");
    }

    handleUpdate(formValues);
  };

  const handleFormChange = (name: string, value: string | object | boolean) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const renderContent = () => {
    const commonProps = {
      ...formValues,
      taskPublicPipelineId: formValues.taskPublicPipelineId || "",
      taskPublicBoardId: formValues.taskPublicBoardId || "",
      handleFormChange,
    };

    switch (configType) {
      case CONFIG_TYPES.GENERAL.VALUE:
        return <General {...commonProps} />;
      case CONFIG_TYPES.APPEARANCE.VALUE:
        return <Appearance {...commonProps} />;
      case CONFIG_TYPES.AUTH.VALUE:
        return <Config {...commonProps} />;
      default:
        return null;
    }
  };

  const renderSubmit = () => {
    return (
      <ButtonWrap>
        <Button btnStyle="success" icon="check-circle" type="submit">
          Submit
        </Button>
      </ButtonWrap>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Content>
        {renderContent()}
        {renderSubmit()}
      </Content>
    </form>
  );
};

export default Form;
