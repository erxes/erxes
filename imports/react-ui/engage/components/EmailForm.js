import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { EMAIL_CONTENT_PLACEHOLDER, EMAIL_CONTENT_CLASS } from '/imports/api/engage/constants';

import Editor from './Editor';

const propTypes = {
  message: PropTypes.object.isRequired,
  templates: PropTypes.array.isRequired,
  onContentChange: PropTypes.func.isRequired,
};

class EmailForm extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const email = message.email || {};

    // current template
    let currentTemplate = EMAIL_CONTENT_PLACEHOLDER;

    if (email.templateId) {
      currentTemplate = this.findTemplate(email.templateId);
    }

    // states
    this.state = { currentTemplate };

    // binds
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
    const { message } = this.props;
    const email = message.email || {};

    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <Editor defaultValue={email.content} onChange={this.onContentChange} />,
        contentContainer[0],
      );
    }
  }

  onContentChange(content) {
    this.props.onContentChange(content);
  }

  renderHeader() {
    const { message, templates } = this.props;
    const email = message.email || {};

    return (
      <div className="form-header">
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
            {templates.map(t =>
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
    return (
      <div>
        {this.renderHeader()}
        <div className="form-content">
          <div dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }} />
        </div>
      </div>
    );
  }
}

EmailForm.propTypes = propTypes;

export default EmailForm;
