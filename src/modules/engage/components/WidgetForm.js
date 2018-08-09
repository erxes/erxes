import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ControlLabel,
  FormGroup,
  FormControl,
  Button,
  Uploader
} from 'modules/common/components';
import { METHODS } from 'modules/engage/constants';
import Editor from './Editor';
import { Recipients, Recipient } from '../styles';
import { ModalFooter } from 'modules/common/styles/main';

class WidgetForm extends Component {
  constructor(props) {
    super(props);

    this.state = { content: '', channel: 'email', attachments: [] };

    this.onChangeCommon = this.onChangeCommon.bind(this);
    this.onChannelChange = this.onChannelChange.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    const { save, customers } = this.props;

    const doc = {
      title: document.getElementById('title').value,
      customerIds: customers.map(customer => customer._id.toString())
    };

    if (this.state.channel === 'email') {
      doc.method = METHODS.EMAIL;
      doc.email = {
        templateId: document.getElementById('emailTemplateId').value,
        subject: document.getElementById('emailSubject').value,
        attachments: this.state.attachments,
        content: this.state.content
      };
    }

    if (this.state.channel === 'messenger') {
      doc.method = METHODS.MESSENGER;
      doc.messenger = {
        brandId: document.getElementById('brandId').value,
        kind: document.getElementById('messengerKind').value,
        sentAs: document.getElementById('sentAs').value,
        content: this.state.content
      };
    }

    return save(doc, () => {
      this.context.closeModal();
    });
  }

  onChangeCommon(name, value) {
    this.setState({ [name]: value });
  }

  onChannelChange(e) {
    this.setState({ channel: e.target.value });
  }

  renderCustomers() {
    return (
      <FormGroup>
        <ControlLabel>To:</ControlLabel>
        <Recipients>
          {this.props.customers.map(customer => (
            <Recipient key={customer._id.toString()}>
              <strong>{customer.name}</strong> {customer.primaryEmail}
            </Recipient>
          ))}
        </Recipients>
      </FormGroup>
    );
  }

  renderEmailContent() {
    if (this.state.channel !== 'email') {
      return null;
    }

    const { attachments } = this.state;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Email subject:</ControlLabel>
          <FormControl id="emailSubject" type="text" required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email templates:</ControlLabel>

          <FormControl id="emailTemplateId" componentClass="select">
            <option />
            {this.props.emailTemplates.map(t => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Attachments:</ControlLabel>
          <Uploader
            defaultFileList={attachments}
            onChange={attachments =>
              this.onChangeCommon('attachments', attachments)
            }
          />
        </FormGroup>
      </div>
    );
  }

  renderMessengerContent() {
    if (this.state.channel !== 'messenger') {
      return null;
    }

    return (
      <div>
        <FormGroup>
          <ControlLabel>Brand:</ControlLabel>

          <FormControl id="brandId" componentClass="select">
            <option />
            {this.props.brands.map((b, index) => (
              <option key={`brand-${index}`} value={b._id}>
                {b.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messenger kind:</ControlLabel>

          <FormControl id="messengerKind" componentClass="select">
            <option />
            {this.props.messengerKinds.map((t, index) => (
              <option key={`messengerKind-${index}`} value={t.value}>
                {t.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Sent as:</ControlLabel>

          <FormControl id="sentAs" componentClass="select">
            <option />
            {this.props.sentAsChoices.map((t, index) => (
              <option key={`sentAs-${index}`} value={t.value}>
                {t.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </div>
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <form onSubmit={this.save}>
        {this.renderCustomers()}

        <FormGroup>
          <ControlLabel>Channel:</ControlLabel>

          <FormControl componentClass="select" onChange={this.onChannelChange}>
            <option value="email">{__('Email')}</option>
            <option value="messenger">{__('Messenger')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Title:</ControlLabel>
          <FormControl id="title" type="text" required />
        </FormGroup>

        {this.renderEmailContent()}
        {this.renderMessengerContent()}

        <FormGroup>
          <ControlLabel>Content:</ControlLabel>
          <Editor
            onChange={content => this.onChangeCommon('content', content)}
          />
        </FormGroup>

        <ModalFooter>
          <Button type="submit" btnStyle="success">
            Send
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

WidgetForm.propTypes = {
  customers: PropTypes.array.isRequired,
  emailTemplates: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  messengerKinds: PropTypes.array.isRequired,
  sentAsChoices: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

WidgetForm.contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

export default WidgetForm;
