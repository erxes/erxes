import React, { PropTypes, Component } from 'react';
import { ButtonGroup, Button, FormControl } from 'react-bootstrap';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

import EmailForm from './EmailForm';
import MessengerForm from './MessengerForm';

const propTypes = {
  message: PropTypes.object,
  save: PropTypes.func.isRequired,
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  users: PropTypes.array,
};

class MessageForm extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};

    this.state = { emailContent: '', messengerContent: '', method: message.method || 'email' };

    // binds
    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
    this.saveAndLive = this.saveAndLive.bind(this);
    this.saveAndDraft = this.saveAndDraft.bind(this);
    this.onEmailContentChange = this.onEmailContentChange.bind(this);
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
    this.onMethodChange = this.onMethodChange.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const method = document.querySelector('input[name="method"]:checked');

    const doc = {
      segmentId: document.getElementById('segmentId').value,
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      method: method ? method.value : '',
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
        content: this.state.messengerContent,
      };
    }

    return doc;
  }

  save(e) {
    const doc = this.generateDoc(e);
    this.props.save(doc);
  }

  saveAndLive(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: true, isDraft: false, ...doc });
  }

  saveAndDraft(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: false, isDraft: true, ...doc });
  }

  onEmailContentChange(content) {
    this.setState({ emailContent: content });
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  onMethodChange(e) {
    this.setState({ method: e.target.value });
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

    return (
      <div className="box">
        <div className="button-box text-center selected">
          <span>Email</span>
          <input
            type="radio"
            name="method"
            value="email"
            onChange={this.onMethodChange}
            defaultChecked={method === 'email'}
          />

          <p>Delivered to a user's email inbox <br />Customize with your own templates</p>
        </div>

        <div className="button-box text-center">
          <span>Messenger</span>
          <input
            type="radio"
            name="method"
            value="messenger"
            onChange={this.onMethodChange}
            defaultChecked={method === 'messenger'}
          />

          <p>Delivered inside your app<br />Reach active users</p>
        </div>
      </div>
    );
  }

  renderButtons(message) {
    const save = (
      <Button bsStyle="link" onClick={this.save}>
        <i className="ion-checkmark-circled" /> Save
      </Button>
    );

    const saveAndLive = (
      <Button bsStyle="link" onClick={this.saveAndLive} key="action-save-live">
        <i className="ion-checkmark-circled" /> Save & live
      </Button>
    );

    const saveAndDraft = (
      <Button bsStyle="link" onClick={this.saveAndDraft} key="action-save-draft">
        <i className="ion-checkmark-circled" /> Save & draft
      </Button>
    );

    if (message._id) {
      return save;
    } else {
      return [saveAndLive, saveAndDraft];
    }
  }

  render() {
    const breadcrumb = [{ title: 'Engage', link: '/engage' }, { title: 'Message' }];

    const message = this.props.message || { email: {}, messenger: {} };

    const { Section } = Wrapper.Sidebar;
    const { Title } = Wrapper.Sidebar.Section;

    const sidebar = (
      <Wrapper.Sidebar size="wide">
        <form onSubmit={this.save}>
          <Section>
            <Title>Title</Title>
            <div className="box">
              <FormControl id="title" defaultValue={message.title} required />
            </div>
          </Section>

          <Section>
            <Title>From</Title>
            <div className="box">
              <FormControl
                id="fromUserId"
                componentClass="select"
                defaultValue={message.fromUserId}
              >

                {this.props.users.map(u =>
                  <option key={u._id} value={u._id}>
                    {u.fullName || u.username}
                  </option>,
                )}
              </FormControl>
            </div>
          </Section>

          <Section>
            <Title>Choose segment</Title>
            {this.renderSegments(message.segmentId)}
          </Section>

          <Section>
            <Title>Channel</Title>
            {this.renderChannelType()}
          </Section>
        </form>
      </Wrapper.Sidebar>
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            {this.renderButtons(message)}

            <Button bsStyle="link" href={FlowRouter.path('engage/home')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = this.state.method === 'email'
      ? <EmailForm
          message={message}
          templates={this.props.templates}
          onContentChange={this.onEmailContentChange}
        />
      : <MessengerForm message={message} onContentChange={this.onMessengerContentChange} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
        leftSidebar={sidebar}
      />
    );
  }
}

MessageForm.propTypes = propTypes;

export default MessageForm;
