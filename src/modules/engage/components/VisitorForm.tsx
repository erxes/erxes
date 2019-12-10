import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import ConditionsRule from 'modules/common/components/rule/ConditionsRule';
import { Step, Steps } from 'modules/common/components/step';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { MESSAGE_KINDS, METHODS } from 'modules/engage/constants';
import {
  IEngageMessage,
  IEngageMessageDoc,
  IEngageMessenger,
  IEngageScheduleDate
} from 'modules/engage/types';
import Wrapper from 'modules/layout/components/Wrapper';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';
import { IBreadCrumbItem, IConditionsRule } from '../../common/types';
import MessengerForm from './MessengerForm';

type Props = {
  kind: string;
  message?: IEngageMessage;
  brands: IBrand[];
  users: IUser[];
  save: (doc: IEngageMessageDoc) => Promise<any>;
  validateDoc: (
    type: string,
    doc: IEngageMessageDoc
  ) => { status: string; doc?: IEngageMessageDoc };
  renderTitle: () => string;
  breadcrumbs: IBreadCrumbItem[];
};

type State = {
  maxStep: number;
  activeStep: number;
  method: string;
  title: string;
  content: string;
  fromUserId: string;
  rules: IConditionsRule[];
  messenger?: IEngageMessenger;
  scheduleDate?: IEngageScheduleDate;
};

class VisitorForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const message = props.message || ({} as IEngageMessage);
    const messenger = message.messenger || ({} as IEngageMessenger);
    const rules = messenger.rules
      ? messenger.rules.map(rule => ({ ...rule }))
      : [];

    this.state = {
      maxStep: 2,
      activeStep: 1,
      method: METHODS.MESSENGER,
      title: message.title || '',
      content: messenger.content || '',
      fromUserId: message.fromUserId || '',
      rules,
      messenger: message.messenger,
      scheduleDate: message.scheduleDate
    };
  }

  changeState = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as Pick<State, keyof State>);
  };

  save = (type: string, e: React.MouseEvent<Element>): Promise<any> | void => {
    e.preventDefault();

    const messenger = this.state.messenger || ({} as IEngageMessenger);

    const doc = {
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      title: this.state.title,
      fromUserId: this.state.fromUserId,
      method: METHODS.MESSENGER,
      messenger: {
        rules: this.state.rules,
        brandId: messenger.brandId,
        sentAs: messenger.sentAs,
        content: this.state.content
      },
      scheduleDate: this.state.scheduleDate
    };

    const response = this.props.validateDoc(type, doc);

    if (response.status === 'ok' && response.doc) {
      return this.props.save(response.doc);
    }
  };

  render() {
    const {
      activeStep,
      maxStep,
      messenger,
      fromUserId,
      content,
      scheduleDate
    } = this.state;

    const { renderTitle, breadcrumbs, kind, users, brands } = this.props;

    const onChange = e =>
      this.changeState('title', (e.target as HTMLInputElement).value);
    return (
      <StepWrapper>
        <Wrapper.Header title={renderTitle()} breadcrumb={breadcrumbs} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl onChange={onChange} defaultValue={this.state.title} />
        </TitleContainer>

        <Steps maxStep={maxStep} active={activeStep}>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
          >
            <ConditionsRule
              rules={this.state.rules}
              onChange={this.changeState}
            />
          </Step>

          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save}
            message={this.props.message}
          >
            <MessengerForm
              brands={brands}
              onChange={this.changeState}
              users={users}
              messageKind={kind}
              hasKind={false}
              messenger={messenger || ({} as IEngageMessenger)}
              fromUserId={fromUserId}
              content={content}
              scheduleDate={scheduleDate || ({} as IEngageScheduleDate)}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

export default VisitorForm;
