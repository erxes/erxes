import React, { PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';

import FormBase from './FormBase';
import EmailForm from './EmailForm';
import MessengerForm from './MessengerForm';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
};

/*
 * Base form for Regular auto & manual
 */

class AutoAndManualForm extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message || {};

    this.state = { emailContent: '', messengerContent: '', method: message.method || 'email' };

    // binds
    this.onEmailContentChange = this.onEmailContentChange.bind(this);
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const method = this.state.method;

    const doc = {
      segmentId: document.getElementById('segmentId').value,
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      method,
    };

    if (this.state.method === 'email') {
      doc.email = {
        templateId: document.getElementById('emailTemplateId').value,
        subject: document.getElementById('emailSubject').value,
        content: this.state.emailContent,
      };
    }

    if (this.state.method === 'messenger') {
      doc.messenger = {
        kind: document.getElementById('messengerKind').value,
        sentAs: document.getElementById('messengerSentAs').value,
        content: this.state.messengerContent,
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

  renderSegments(defaultValue) {
    const renderSegment = segment => {
      return <option key={segment._id} value={segment._id}>{segment.name}</option>;
    };

    return (
      <div className="box">
        <FormControl componentClass="select" id="segmentId" defaultValue={defaultValue}>
          {this.props.segments.map(segment => renderSegment(segment))}
        </FormControl>
        <p>Send email to each customer who belongs to above segment</p>
      </div>
    );
  }

  renderChannelType() {
    const method = this.state.method;
    const boxClass = 'button-box text-center';

    return (
      <div className="box">
        <div
          className={`${boxClass} ${method === 'email' ? 'selected' : ''}`}
          onClick={() => this.onClickBox('email')}
        >
          <span>Email</span>
          <p>Delivered to a user's email inbox <br />Customize with your own templates</p>
        </div>

        <div
          className={`${boxClass} ${method === 'messenger' ? 'selected' : ''}`}
          onClick={() => this.onClickBox('messenger')}
        >
          <span>Messenger</span>
          <p>Delivered inside your app<br />Reach active users</p>
        </div>
      </div>
    );
  }

  renderSidebarExtra() {
    const message = this.getMessage();

    const { Section } = Wrapper.Sidebar;
    const { Title } = Wrapper.Sidebar.Section;

    return (
      <div>
        <Section>
          <Title>Choose segment</Title>
          {this.renderSegments(message.segmentId)}
        </Section>

        <Section>
          <Title>Channel</Title>
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
        onContentChange={this.onMessengerContentChange}
      />
    );
  }
}

AutoAndManualForm.propTypes = propTypes;

export default AutoAndManualForm;
