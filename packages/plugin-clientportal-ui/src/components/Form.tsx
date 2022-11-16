import Button from '@erxes/ui/src/components/Button';
import { Alert } from '@erxes/ui/src/utils';
import { removeTypename } from '@erxes/ui/src/utils/core';
import React from 'react';

import { CONFIG_TYPES } from '../constants';
import General from '../containers/General';
import { ButtonWrap, Content } from '../styles';
import { ClientPortalConfig, MailConfig } from '../types';
import Appearance from './forms/Appearance';
import Config from './forms/Config';

type Props = {
  configType: string;
  defaultConfigValues?: ClientPortalConfig;
  handleUpdate: (doc: ClientPortalConfig) => void;
};

type State = {
  formValues: ClientPortalConfig;
};

const isUrl = (value: string): boolean => {
  try {
    return Boolean(new URL(value));
  } catch (e) {
    return false;
  }
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      formValues: props.defaultConfigValues || ({} as ClientPortalConfig)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.defaultConfigValues &&
      nextProps.defaultConfigValues !== this.props.defaultConfigValues
    ) {
      this.setState({ formValues: nextProps.defaultConfigValues });
    }
  }
  s;
  handleSubmit = e => {
    e.preventDefault();
    const { formValues } = this.state;

    if (!formValues.name) {
      return Alert.error('Please enter a client portal name');
    }

    if (formValues.url && !isUrl(formValues.url)) {
      return Alert.error('Please enter a valid URL');
    }

    if (formValues.domain && !isUrl(formValues.domain)) {
      return Alert.error('Please enter a valid domain');
    }

    if (!formValues.knowledgeBaseTopicId) {
      return Alert.error('Please choose a Knowledge base topic');
    }

    if (!formValues.taskPublicBoardId) {
      return Alert.error('Please select a public task board first');
    }

    if (!formValues.taskPublicPipelineId) {
      return Alert.error('Please select a public task pipeline');
    }

    delete (formValues.styles || ({} as any)).__typename;

    if (formValues.mailConfig) {
      const mailConfig: MailConfig =
        removeTypename(formValues.mailConfig) || {};

      if (!mailConfig.registrationContent.match(/{{ link }}/g)) {
        return Alert.error(
          'Please add {{ link }} to registration mail content to send verification link'
        );
      }

      if (!mailConfig.invitationContent.match(/{{ link }}|{{ password }}/g)) {
        return Alert.error(
          'Please add {{ link }} and {{ password }} to invitation mail content to send verification link and password'
        );
      }

      formValues.mailConfig = mailConfig;
    }

    if (formValues.otpConfig) {
      const { content } = formValues.otpConfig;

      if (!content.match(/{{ code }}/g)) {
        return Alert.error(
          'Please add {{ code }} to OTP content to send verification code'
        );
      }

      formValues.otpConfig = removeTypename(formValues.otpConfig);
    }

    this.props.handleUpdate(formValues);
  };

  handleFormChange = (name: string, value: string | object | boolean) => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [name]: value
      }
    });
  };

  renderContent = () => {
    const commonProps = {
      ...this.state.formValues,
      handleFormChange: this.handleFormChange
    };

    switch (this.props.configType) {
      case CONFIG_TYPES.GENERAL.VALUE:
        return <General {...commonProps} />;
      case CONFIG_TYPES.APPEARANCE.VALUE:
        return <Appearance {...commonProps} />;
      case CONFIG_TYPES.CUSTOM.VALUE:
        return <Config {...commonProps} />;
      default:
        return null;
    }
  };

  renderSubmit = () => {
    return (
      <ButtonWrap>
        <Button btnStyle="success" icon="check-circle" type="submit">
          Submit
        </Button>
      </ButtonWrap>
    );
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Content>
          {this.renderContent()}
          {this.renderSubmit()}
        </Content>
      </form>
    );
  }
}

export default Form;
