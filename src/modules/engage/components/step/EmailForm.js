import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { EMAIL_CONTENT_CLASS } from 'modules/engage/constants';
import Editor from '../Editor';
import { EditorWrapper } from '../../styles';

const Content = styled.div`
  display: flex;
  height: 100%;
  margin: 20px;
`;

const FlexItem = styled.div`
  flex: 1;
  overflow: auto;
  padding: 10px;
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1;
  overflow: auto;
`;

const propTypes = {
  changeEmail: PropTypes.func,
  changeMessage: PropTypes.func,
  message: PropTypes.string,
  changeUser: PropTypes.func,
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
    if (this.state.currentTemplate !== prevState.currentTemplate) {
      this.renderBuilder();
    }
  }

  changeContent(key, value) {
    let email = { ...this.state.email };
    email[key] = value;
    this.setState({ email });
    this.props.changeEmail(this.state.email);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeUser(fromUser);
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
        <Editor
          defaultValue={this.props.message}
          onChange={() => this.props.changeEmail(this.state.email)}
        />,
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
      <Content>
        <FlexItem>
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
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <EditorWrapper>
              <Editor onChange={this.props.changeMessage} />
            </EditorWrapper>
          </FormGroup>
        </FlexItem>
        <Divider />
        <ContentCenter>{content}</ContentCenter>
      </Content>
    );
  }
}

EmailForm.propTypes = propTypes;

export default EmailForm;
