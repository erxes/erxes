import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { EMAIL_CONTENT_CLASS } from 'modules/engage/constants';
import Editor from '../Editor';
import { EditorWrapper } from '../../styles';
import { FlexItem, Divider, FlexPad } from './Style';

const propTypes = {
  changeEmail: PropTypes.func,
  message: PropTypes.string,
  users: PropTypes.array,
  templates: PropTypes.array
};

class EmailForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromUser: '',
      currentTemplate: '',
      email: {
        subject: '',
        templateId: ''
      }
    };
  }

  componentDidMount() {
    this.renderBuilder();
  }

  componentDidUpdate(prevProps, prevState) {
    // only after current template change
    if (
      this.state.currentTemplate !== prevState.currentTemplate ||
      this.props.message !== prevProps.message
    ) {
      this.renderBuilder();
    }
  }

  changeContent(key, value) {
    let email = { ...this.state.email };
    email[key] = value;
    this.setState({ email });
    this.props.changeEmail('email', this.state.email);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeEmail('fromUser', fromUser);
  }

  templateChange(value) {
    this.changeContent('templateId', value);
    this.setState({ currentTemplate: this.findTemplate(value) });
  }

  findTemplate(id) {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  }

  renderBuilder() {
    const contentContainer = document.getElementsByClassName(
      EMAIL_CONTENT_CLASS
    );
    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <div dangerouslySetInnerHTML={{ __html: this.props.message }} />,
        contentContainer[0]
      );
    }
  }

  render() {
    let content = '';

    if (this.state.currentTemplate !== '') {
      content = (
        <EditorWrapper>
          <div
            dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }}
          />
        </EditorWrapper>
      );
    }

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <EditorWrapper>
              <Editor onChange={this.props.changeEmail} />
            </EditorWrapper>
          </FormGroup>
          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeUser(e.target.value)}
            >
              <option />
              {this.props.users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName || u.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Email subject:</ControlLabel>
            <FormControl
              onChange={e => this.changeContent('subject', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Email template:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.templateChange(e.target.value)}
            >
              <option />
              {this.props.templates.map(t => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </FlexPad>
        <Divider />
        <FlexItem v="center" h="center" overflow="auto">
          {content}
        </FlexItem>
      </FlexItem>
    );
  }
}

EmailForm.propTypes = propTypes;

export default EmailForm;
