import * as React from 'react';
import * as routerUtils from '@erxes/ui/src/utils/router';

import {
  IButtonMutateProps,
  IFormProps,
  IRouterProps
} from '@erxes/ui/src/types';
import { IExchangeForm, IImapForm, IntegrationTypes } from '../../types';

import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ExchangeForm from './ExchangeForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ImapForm from './ImapForm';
import Info from '@erxes/ui/src/components/Info';
import MailAuthForm from './MailAuthForm';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { __ } from 'coreui/utils';
import { withRouter } from 'react-router-dom';

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
                href="https://erxes.io/help/knowledge-base/article/detail?catId=5o5ZRSi5c8NX3fbTA&_id=B7LseAvFdKsiLa3kG"
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
