import { IUser } from 'modules/auth/types';
import {
  ConditionStep,
  FormControl,
  Step,
  Steps
} from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { MESSAGE_KINDS, METHODS } from 'modules/engage/constants';
import { Wrapper } from 'modules/layout/components';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import MessengerForm from './MessengerForm';

type Props = {
  message: any;
  brands: IBrand[];
  users: IUser[];
  validateAndSaveForm: (type: string, doc: any) => void;
  renderTitle: () => void;
  changeState: (name: string, value: string | any[]) => void;
};

type State = {
  maxStep: number;
  activeStep: number;
  method: string;
  title: string;
  message: string;
  fromUser: string;
  rules: string[];
  messenger: any;
  scheduleDate: Date;
}

class VisitorForm extends React.Component<Props, State> {
  private next;

  constructor(props: Props) {
    super(props);

    const { message } = props;
    const messenger = message.messenger || {};
    const rules = messenger.rules
      ? messenger.rules.map(rule => ({ ...rule }))
      : [];

    this.state = {
      maxStep: 2,
      activeStep: 1,
      method: METHODS.MESSENGER,
      title: message.title || '',
      message: messenger.content || '',
      fromUser: message.fromUserId || '',
      rules,
      messenger: message.messenger,
      scheduleDate: message.scheduleDate
    };
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: METHODS.MESSENGER,
      messenger: {
        rules: this.state.rules,
        brandId: this.state.messenger.brandId,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      },
      scheduleDate: this.state.scheduleDate
    };

    return doc;
  }

  render() {
    const {
      activeStep,
      maxStep,
      messenger,
      fromUser,
      message,
      rules,
      scheduleDate
    } = this.state;

    const defaultMessengerValue = {
      messenger,
      fromUser,
      message,
      rules,
      scheduleDate
    };

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={this.props.renderTitle()} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            onChange={e => this.props.changeState('title', (e.target as HTMLInputElement).value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>

        <Steps maxStep={maxStep} active={activeStep}>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <ConditionStep
              rules={this.state.rules}
              changeRules={this.props.changeState}
            />
          </Step>

          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.props.validateAndSaveForm}
            next={this.next}
            message={this.props.message}
          >
            <MessengerForm
              brands={this.props.brands}
              changeMessenger={this.props.changeState}
              users={this.props.users}
              hasKind={false}
              defaultValue={defaultMessengerValue}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

export default VisitorForm;
