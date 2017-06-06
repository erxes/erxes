import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import {
  Row,
  Col,
  ButtonGroup,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
} from 'react-bootstrap';

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
    this.save = this.save.bind(this);
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

  save(e) {
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

    this.props.save(doc);
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
        <ControlLabel>Segment</ControlLabel>

        <FormControl componentClass="select" id="segmentId" defaultValue={defaultValue}>
          {this.props.segments.map(segment => renderSegment(segment))}
        </FormControl>
      </FormGroup>
    );
  }

  render() {
    const breadcrumb = [{ title: 'Engage', link: '/engage' }];

    const message = this.props.message || {};
    const email = message.email || {};

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>
            <Button bsStyle="link" href={FlowRouter.path('engage/messages/list')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = (
      <div className="margined">
        <form onSubmit={this.save}>
          {this.renderSegments(message.segmentId)}

          <FormGroup>
            <ControlLabel>Title</ControlLabel>
            <FormControl id="title" defaultValue={message.title} required />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From</ControlLabel>

            <FormControl id="fromUserId" componentClass="select" defaultValue={message.fromUserId}>

              {this.props.users.map(u =>
                <option key={u._id} value={u._id}>
                  {u.fullName || u.username}
                </option>,
              )}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email subject</ControlLabel>
            <FormControl id="emailSubject" defaultValue={email.subject} required />
          </FormGroup>

          <Row>
            <Col md={4}>
              <FormGroup>
                <ControlLabel>Email templates</ControlLabel>

                <FormControl
                  id="emailTemplateId"
                  componentClass="select"
                  onChange={this.onTemplateChange}
                  defaultValue={email.templateId}
                >

                  {this.props.templates.map(t =>
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>,
                  )}
                </FormControl>
              </FormGroup>
            </Col>

            <Col md={8}>
              <div dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }} />
            </Col>
          </Row>
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
