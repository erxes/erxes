import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  IRouterProps
} from 'modules/common/types';
import { __ } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { IExchangeForm, IImapForm, IntegrationTypes } from '../../types';
import ExchangeForm from './ExchangeForm';
import ImapForm from './ImapForm';
import MailAuthForm from './MailAuthForm';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  kind: IntegrationTypes;
  email?: string;
} & IRouterProps;

type State = {
  channelIds: string[];
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channelIds: []
    };
  }

  onChannelChange = (values: string[]) => {
    this.setState({ channelIds: values });
  };

  generateDoc = (
    values: { name: string; brandId: string } & IImapForm & IExchangeForm
  ) => {
    const { kind, history } = this.props;
    const { name, brandId, ...args } = values;

    const uid = routerUtils.getParam(history, 'uid');

    return {
      kind,
      name,
      brandId,
      channelIds: this.state.channelIds,
      data: {
        id: 'requestId',
        uid,
        ...args
      }
    };
  };

  renderProvideForm(formProps: IFormProps) {
    const { kind } = this.props;

    if (['nylas-gmail', 'nylas-office365'].includes(kind)) {
      return null;
    }

    if (kind === 'nylas-imap') {
      return <ImapForm formProps={formProps} />;
    }

    if (kind === 'nylas-exchange') {
      return <ExchangeForm formProps={formProps} />;
    }

    return <MailAuthForm formProps={formProps} kind={kind} />;
  }

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <Info>
            <strong>{__('Email add account description question')}</strong>
            <br />
            <p>{__('Email add account description')}</p>
            <p>
              <a
                target="_blank"
                href="https://erxes.io/help/knowledge-base/article/detail?_id=B7LseAvFdKsiLa3kG"
                rel="noopener noreferrer"
              >
                {__('Learn how to connect a Gmail using IMAP')}
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
            'Which specific Brand does this integration belong to?'
          )}
        />

        <SelectChannels
          defaultValue={this.state.channelIds}
          isRequired={true}
          onChange={this.onChannelChange}
        />

        {this.renderProvideForm(formProps)}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          {this.props.renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default withRouter(Form);
