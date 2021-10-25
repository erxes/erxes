import { Alert } from 'modules/common/utils';
import React from 'react';
import { CONFIG_TYPES } from '../constants';
import General from '../containers/General';
import { ClientPortalConfig } from '../types';
import Appearance from './forms/Appearance';
import Config from './forms/Config';
import { ButtonWrap, Content } from '../styles';
import Button from 'modules/common/components/Button';

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

    this.props.handleUpdate(formValues);
  };

  handleFormChange = (name: string, value: string | object) => {
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
