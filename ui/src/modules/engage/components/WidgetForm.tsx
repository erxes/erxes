import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Uploader from 'modules/common/components/Uploader';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { METHODS } from 'modules/engage/constants';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import { MAIL_TOOLBARS_CONFIG } from 'modules/settings/integrations/constants';
import React from 'react';
import Select from 'react-select-plus';
import { IAttachment } from '../../common/types';
import { IBrand } from '../../settings/brands/types';
import MessengerPreview from '../containers/MessengerPreview';
import { Half, Recipient, Recipients } from '../styles';
import { IEngageEmail, IEngageMessageDoc, IEngageMessenger } from '../types';
import { generateEmailTemplateParams } from '../utils';

type Props = {
  customers: ICustomer[];
  emailTemplates: IEmailTemplate[];
  brands: IBrand[];
  messengerKinds: any[];
  sentAsChoices: any[];
  save: (doc: IEngageMessageDoc, closeModal: () => void) => void;
  closeModal: () => void;
  channelType?: string;
  currentUser: IUser;
};

type State = {
  content: string;
  channel: string;
  attachments: IAttachment[];
  sentAs: string;
  templateId: string;
};

class WidgetForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      content: '',
      channel: props.channelType || 'email',
      attachments: [],
      sentAs: 'snippet',
      templateId: ''
    };
  }

  save = e => {
    e.preventDefault();

    const { save, customers } = this.props;

    const doc = {
      title: (document.getElementById('title') as HTMLInputElement).value,
      customerIds: customers.map(customer => customer._id),
      method: ''
    } as IEngageMessageDoc;

    if (this.state.channel === 'email') {
      doc.method = METHODS.EMAIL;
      doc.email = {
        subject: (document.getElementById('emailSubject') as HTMLInputElement)
          .value,
        attachments: this.state.attachments,
        content: this.state.content
      } as IEngageEmail;
    }

    if (this.state.channel === 'messenger') {
      doc.method = METHODS.MESSENGER;
      doc.messenger = {
        brandId: (document.getElementById('brandId') as HTMLInputElement).value,
        kind: (document.getElementById('messengerKind') as HTMLInputElement)
          .value,
        sentAs: (document.getElementById('sentAs') as HTMLInputElement).value,
        content: this.state.content
      } as IEngageMessenger;
    }

    return save(doc, () => this.props.closeModal());
  };

  onChangeCommon = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onChannelChange = e => {
    this.setState({ channel: e.target.value });
  };

  templateChange = e => {
    this.setState({ content: this.findTemplate(e.value), templateId: e.value });
  };

  onEditorChange = e => {
    this.onChangeCommon('content', e.editor.getData());
  };

  onSentAsChange = e => {
    this.onChangeCommon('sentAs', e.target.value);
  };

  findTemplate = id => {
    const template = this.props.emailTemplates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  };

  renderReceivers() {
    return (
      <FormGroup>
        <ControlLabel>Sending to:</ControlLabel>
        <Recipients>
          {this.props.customers.map(customer => (
            <Recipient key={customer._id}>
              <strong>{customer.firstName}</strong>
              <span>({customer.primaryEmail || 'Unknown'})</span>
            </Recipient>
          ))}
        </Recipients>
      </FormGroup>
    );
  }

  renderChannelType() {
    if (this.props.channelType) {
      return null;
    }

    return (
      <Half>
        <FormGroup>
          <ControlLabel>Channel:</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={this.onChannelChange}
            defaultValue={this.state.channel}
          >
            <option value="email">{__('Email')}</option>
            <option value="messenger">{__('Messenger')}</option>
          </FormControl>
        </FormGroup>
      </Half>
    );
  }

  renderFormContent() {
    const currentUser = this.props.currentUser;

    const editor = (options?) => (
      <EditorCK
        {...options}
        content={this.state.content}
        onChange={this.onEditorChange}
        insertItems={EMAIL_CONTENT}
        toolbar={[
          { name: 'insert', items: ['strinsert'] },
          ...MAIL_TOOLBARS_CONFIG
        ]}
        name={`engage_widget_${this.state.channel}_${currentUser._id}`}
      />
    );

    if (this.state.channel === 'messenger') {
      return (
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel required={true}>Brand:</ControlLabel>

              <FormControl id="brandId" componentClass="select" required={true}>
                <option />
                {this.props.brands.map((b, index) => (
                  <option key={`brand-${index}`} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <div>
              <FlexContent>
                <FlexItem>
                  <FormGroup>
                    <ControlLabel required={true}>Messenger kind:</ControlLabel>

                    <FormControl
                      id="messengerKind"
                      componentClass="select"
                      required={true}
                    >
                      <option />
                      {this.props.messengerKinds.map((t, index) => (
                        <option key={`messengerKind-${index}`} value={t.value}>
                          {t.text}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                </FlexItem>
                <FlexItem hasSpace={true}>
                  <FormGroup>
                    <ControlLabel>Sent as:</ControlLabel>

                    <FormControl
                      id="sentAs"
                      defaultValue={this.state.sentAs}
                      componentClass="select"
                      onChange={this.onSentAsChange}
                    >
                      {this.props.sentAsChoices.map((t, index) => (
                        <option key={`sentAs-${index}`} value={t.value}>
                          {t.text}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                </FlexItem>
              </FlexContent>
            </div>

            {editor()}
          </FlexItem>

          <FlexItem>
            <MessengerPreview
              sentAs={this.state.sentAs}
              content={this.state.content}
              fromUserId={this.props.currentUser._id}
            />
          </FlexItem>
        </FlexContent>
      );
    }

    const { attachments } = this.state;
    const onChange = attachmentsAtt =>
      this.onChangeCommon('attachments', attachmentsAtt);

    return (
      <>
        <Half>
          <FormGroup>
            <ControlLabel>Email subject:</ControlLabel>
            <FormControl id="emailSubject" type="text" required={true} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email templates:</ControlLabel>
            <p>{__('Insert email template to content')}</p>

            <Select
              value={this.state.templateId}
              onChange={this.templateChange}
              options={generateEmailTemplateParams(this.props.emailTemplates)}
              clearable={false}
            />
          </FormGroup>
        </Half>

        <FormGroup>{editor({ height: 300 })}</FormGroup>

        <FormGroup>
          <ControlLabel>Attachments:</ControlLabel>
          <Uploader defaultFileList={attachments} onChange={onChange} />
        </FormGroup>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderReceivers()}
        {this.renderChannelType()}

        <Half>
          <FormGroup>
            <ControlLabel required={true}>Title:</ControlLabel>
            <FormControl
              autoFocus={true}
              id="title"
              type="text"
              required={true}
            />
          </FormGroup>
        </Half>

        {this.renderFormContent()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.closeModal}
          >
            Close
          </Button>
          <Button
            uppercase={false}
            type="submit"
            btnStyle="success"
            icon="message"
          >
            Send
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default WidgetForm;
