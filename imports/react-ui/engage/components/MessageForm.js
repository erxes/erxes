import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { ButtonGroup, Button, FormControl, FormGroup } from 'react-bootstrap';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

import { EMAIL_CONTENT_PLACEHOLDER, EMAIL_CONTENT_CLASS } from '/imports/api/engage/constants';

import Editor from './Editor';

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
    const email = message.email || {};
    const content = email.content || '';

    // current template
    let currentTemplate = EMAIL_CONTENT_PLACEHOLDER;

    if (email.templateId) {
      currentTemplate = this.findTemplate(email.templateId);
    }

    // states
    this.state = { content, currentTemplate };

    // binds
    this.generateDoc = this.generateDoc.bind(this);
    this.saveAndLive = this.saveAndLive.bind(this);
    this.saveAndDraft = this.saveAndDraft.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
    this.onTemplateChange = this.onTemplateChange.bind(this);
  }

  onTemplateChange(e) {
    this.setState({ currentTemplate: this.findTemplate(e.target.value) });
  }

  componentDidMount() {
    this.renderBuilder();
  }

  componentDidUpdate(prevProps, prevState) {
    // only after current template change
    if (this.state.currentTemplate !== prevState.currentTemplate) {
      this.renderBuilder();
    }
  }

  findTemplate(id) {
    const template = this.props.templates.find(t => t._id === id);
    return template.content;
  }

  renderBuilder() {
    const contentContainer = document.getElementsByClassName(EMAIL_CONTENT_CLASS);
    const message = this.props.message || { email: {} };

    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <Editor defaultValue={message.email.content} onChange={this.onContentChange} />,
        contentContainer[0],
      );
    }
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      segmentId: document.getElementById('segmentId').value,
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      email: {
        templateId: document.getElementById('emailTemplateId').value,
        subject: document.getElementById('emailSubject').value,
        content: this.state.content,
      },
    };

    return doc;
  }

  saveAndLive(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: true, isDraft: false, ...doc });
  }

  saveAndDraft(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: false, isDraft: true, ...doc });
  }

  onContentChange(content) {
    this.setState({ content });
  }

  renderSegments(defaultValue) {
    const renderSegment = segment => {
      return <option key={segment._id} value={segment._id}>{segment.name}</option>;
    };

    return (
      <FormGroup>
        <FormControl componentClass="select" id="segmentId" defaultValue={defaultValue}>
          {this.props.segments.map(segment => renderSegment(segment))}
        </FormControl>
      </FormGroup>
    );
  }

  renderChannelType() {
    return (
      <div className="row-section">
        <div className="row-heading">
          <h4>Channel</h4>
        </div>
        <div className="row-content">
          <div className="button-box text-center selected">
            <span>Email</span>
            <p>Delivered to a user's email inbox <br />Customize with your own templates</p>
          </div>
          <div className="button-box text-center">
            <span>Messenger</span>
            <p>Delivered inside your app<br />Reach active users</p>
          </div>
        </div>
      </div>
    );
  }

  renderEmailHeader() {
    const message = this.props.message || {};
    const email = message.email || {};

    return (
      <div className="email-header">
        <div className="header-row">
          <span>From:</span>
          <FormControl id="fromUserId" componentClass="select" defaultValue={message.fromUserId}>
            {this.props.users.map(u =>
              <option key={u._id} value={u._id}>
                {u.fullName || u.username}
              </option>,
            )}
          </FormControl>
        </div>

        <div className="header-row">
          <span>Email subject:</span>
          <FormControl id="emailSubject" defaultValue={email.subject} required />
        </div>

        <div className="header-row">
          <span>Email template:</span>
          <FormControl
            id="emailTemplateId"
            componentClass="select"
            onChange={this.onTemplateChange}
            defaultValue={email.templateId}
          >

            <option />
            {this.props.templates.map(t =>
              <option key={t._id} value={t._id}>
                {t.name}
              </option>,
            )}
          </FormControl>
        </div>
      </div>
    );
  }

  render() {
    const breadcrumb = [{ title: 'Engage', link: '/engage' }];

    const message = this.props.message || {};

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.saveAndLive}>
              <i className="ion-checkmark-circled" /> Save & live
            </Button>

            <Button bsStyle="link" onClick={this.saveAndDraft}>
              <i className="ion-checkmark-circled" /> Save & draft
            </Button>

            <Button bsStyle="link" href={FlowRouter.path('engage/messages/list')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = (
      <div className="engage-box">
        <form onSubmit={this.save}>
          <div className="row-section">
            <div className="row-heading">
              <h4>Title</h4>
            </div>
            <div className="row-content">
              <FormControl id="title" defaultValue={message.title} required />
            </div>
          </div>

          <div className="row-section">
            <div className="row-heading">
              <h4>Segment</h4>
            </div>
            <div className="row-content">
              {this.renderSegments(message.segmentId)}
              <p>Send email to each customer who belongs to above segment</p>
            </div>
          </div>

          {this.renderChannelType()}

          <div className="row-section">
            <div className="row-heading">
              <h4>Content</h4>
            </div>
            <div className="row-content">
              <div className="browser-preview">
                <div className="browser-icons" />
                {this.renderEmailHeader()}
                <div className="email-content">
                  <div dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

MessageForm.propTypes = propTypes;

export default MessageForm;
