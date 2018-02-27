import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';

import FormBase from './FormBase';
import EmailForm from './EmailForm';
import MessengerForm from './MessengerForm';
import Segments from './Segments';
import { EngageBox, ButtonBox } from '../styles';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  brands: PropTypes.array,
  counts: PropTypes.object
};

/*
 * Base form for Regular auto & manual
 */

class AutoAndManualForm extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message || {};

    this.state = {
      emailContent: '',
      messengerContent: '',
      method: message.method || 'email',
      fromUser: message.fromUserId || '',
      chosenSegment: message.segmentId || ''
    };

    // binds
    this.onEmailContentChange = this.onEmailContentChange.bind(this);
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
    this.onChangeSegment = this.onChangeSegment.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const method = this.state.method;

    const doc = {
      segmentId: this.state.chosenSegment,
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      method
    };

    if (this.state.method === 'email') {
      doc.email = {
        templateId: document.getElementById('emailTemplateId').value,
        subject: document.getElementById('emailSubject').value,
        content: this.state.emailContent
      };
    }

    if (this.state.method === 'messenger') {
      doc.messenger = {
        brandId: document.getElementById('brandId').value,
        kind: document.getElementById('messengerKind').value,
        sentAs: document.getElementById('messengerSentAs').value,
        content: this.state.messengerContent
      };
    }

    return doc;
  }

  onEmailContentChange(content) {
    this.setState({ emailContent: content });
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  onClickBox(method) {
    this.setState({ method });
  }

  onChangeSegment(value) {
    this.setState({ chosenSegment: value });
  }

  renderChannelType() {
    const method = this.state.method;
    const { __ } = this.context;

    return (
      <EngageBox>
        <ButtonBox
          selected={method === 'email'}
          onClick={() => this.onClickBox('email')}
        >
          <span>{__('Email')}</span>
          <p>
            {__('Delivered to a user s email inbox')} <br />
            {__('Customize with your own templates')}
          </p>
        </ButtonBox>

        <ButtonBox
          selected={method === 'messenger'}
          onClick={() => this.onClickBox('messenger')}
        >
          <span>{__('Messenger')}</span>
          <p>
            {__('Delivered inside your app')} <br />
            {__('Reach active users')}
          </p>
        </ButtonBox>
      </EngageBox>
    );
  }

  renderSidebarExtra() {
    const message = this.getMessage();

    const { Section } = Wrapper.Sidebar;
    const { Title } = Wrapper.Sidebar.Section;
    const { __ } = this.context;

    return (
      <div>
        <Segments
          segments={this.props.segments}
          defaultSegment={message.segmentId}
          onChangeSegments={this.onChangeSegment}
          counts={this.props.counts}
        />

        <Section>
          <Title>{__('Channel')}</Title>
          {this.renderChannelType()}
        </Section>
      </div>
    );
  }

  renderContent() {
    const message = this.getMessage();

    if (this.state.method === 'email') {
      return (
        <EmailForm
          message={message}
          templates={this.props.templates}
          onContentChange={this.onEmailContentChange}
        />
      );
    }

    return (
      <MessengerForm
        showMessengerType
        message={message}
        fromUser={this.state.fromUser}
        onContentChange={this.onMessengerContentChange}
        brands={this.props.brands}
      />
    );
  }
}

AutoAndManualForm.propTypes = propTypes;
AutoAndManualForm.contextTypes = {
  __: PropTypes.func
};

export default AutoAndManualForm;
