import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import Spinner from 'modules/common/components/Spinner';
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
  email?: string;
  password?: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  loading: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

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
        {this.state.loading && <Spinner />}
        <FormGroup>
          <Info>
            <strong>{__('Email add account description question')}</strong>
            <br />
            {__('Email add account description')}
            <br />
            <a
              target="_blank"
              href="https://www.erxes.org/administrator/system-config/#gmail-imap"
              rel="noopener noreferrer"
            >
              {__('Learn how to connect a Gmail using IMAP')}
            </a>
          </Info>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        {this.renderProvideForm(formProps)}

        <ModalFooter>
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
