import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import {
  Row,
  Col,
  ButtonGroup,
  Button,
  ControlLabel,
  FormControl,
  Checkbox,
  FormGroup,
} from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import ContentBuilder from './ContentBuilder';

const propTypes = {
  message: PropTypes.object,
  save: PropTypes.func.isRequired,
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
};

class MessageForm extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const email = message.email || {};
    const content = email.content || '';

    // current template
    let currentTemplate = '<div class="main"></div>';

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
    const contentContainer = document.getElementsByClassName('main');
    const message = this.props.message || { email: {} };

    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <ContentBuilder defaultValue={message.email.content} onChange={this.onContentChange} />,
        contentContainer[0],
      );
    }
  }

  save(e) {
    e.preventDefault();

    const doc = {
      segmentId: document.getElementById('segmentId').value,
      title: document.getElementById('title').value,
      isAuto: document.getElementById('isAuto').checked,
      email: {
        templateId: document.getElementById('emailTemplateId').value,
        subject: document.getElementById('emailSubject').value,
        from: document.getElementById('emailFrom').value,
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
            <ControlLabel>Email subject</ControlLabel>
            <FormControl id="emailSubject" defaultValue={email.subject} required />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email from</ControlLabel>
            <FormControl id="emailFrom" defaultValue={email.from} required />
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

                  {this.props.templates.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </Col>

            <Col md={8}>
              <div dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }} />
            </Col>
          </Row>

          <FormGroup>
            <ControlLabel>Is auto</ControlLabel>

            <Checkbox defaultChecked={message.isAuto} id="isAuto" />
          </FormGroup>
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
