import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepHeader,
  StepHeaderNumber,
  ButtonBox,
  StepContent,
  StepSidebar,
  StepIcons,
  StepIcon,
  FormHeader
} from '../../styles';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Icon
} from 'modules/common/components';
import {
  EMAIL_CONTENT_PLACEHOLDER,
  MESSENGER_KINDS,
  SENT_AS_CHOICES
} from 'modules/engage/constants';

const propTypes = {
  templates: PropTypes.array,
  message: PropTypes.object,
  brands: PropTypes.array,
  showMessengerType: PropTypes.bool
};

class Step1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      method: 'email',
      messengerContent: '',
      currentTemplate: EMAIL_CONTENT_PLACEHOLDER,
      stepContentWidth: '100%'
    };

    this.onTemplateChange = this.onTemplateChange.bind(this);
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
  }

  onClickBox(method) {
    this.setState({ method });
  }

  onTemplateChange(e) {
    this.setState({ currentTemplate: this.findTemplate(e.target.value) });
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  renderMessageType(messenger) {
    if (this.props.showMessengerType) {
      return (
        <FormGroup>
          <ControlLabel>Message type:</ControlLabel>
          <FormControl
            id="messengerKind"
            componentClass="select"
            defaultValue={messenger.kind}
          >
            <option />
            {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
              <option key={k.value} value={k.value}>
                {k.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      );
    }
  }

  findTemplate(id) {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  }

  onChangeWidth(width) {
    this.setState({ stepContentWidth: width });
  }

  render() {
    const { templates, message, brands } = this.props;
    const method = this.state.method;
    const messenger = message.messenger || {};

    const methodList = (
      <div>
        <ButtonBox
          selected={method === 'email'}
          onClick={() => this.onClickBox('email')}
        >
          <span>Email</span>
          <p>
            Delivered to a user s email inbox
            <br />Customize with your own templates
          </p>
        </ButtonBox>
        <ButtonBox
          selected={method === 'messenger'}
          onClick={() => this.onClickBox('messenger')}
        >
          <span>Messenger</span>
          <p>
            Delivered inside your app<br />Reach active users
          </p>
        </ButtonBox>
      </div>
    );

    const templateForm = (
      <FormHeader>
        <FormGroup>
          <ControlLabel>Email template:</ControlLabel>
          <FormControl
            id="emailTemplateId"
            componentClass="select"
            onChange={this.onTemplateChange}
          >
            <option />{' '}
            {templates.map(t => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </FormHeader>
    );

    const messengerForm = (
      <FormHeader>
        <FormGroup>
          <ControlLabel>Brand:</ControlLabel>
          <FormControl
            id="brandId"
            componentClass="select"
            defaultValue={messenger.brandId}
          >
            <option />
            {brands.map(b => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {this.renderMessageType(messenger)}

        <FormGroup>
          <ControlLabel>Sent as:</ControlLabel>
          <FormControl
            id="messengerSentAs"
            componentClass="select"
            onChange={this.onChangeSentAs}
            defaultValue={messenger.sentAs}
          >
            <option />
            {SENT_AS_CHOICES.SELECT_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>
                {s.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </FormHeader>
    );

    let render = '';

    if (this.state.method === 'email') {
      render = (
        <div>
          <StepHeader>
            <StepHeaderNumber>1</StepHeaderNumber>Choose template
          </StepHeader>

          <StepSidebar>
            {methodList}
            {templateForm}
          </StepSidebar>
          <StepContent>
            <StepIcons>
              <StepIcon>
                <Icon
                  icon="android-laptop"
                  size={32}
                  onClick={() => this.onChangeWidth()}
                />
              </StepIcon>
              <StepIcon>
                <Icon
                  icon="ipad"
                  size={32}
                  onClick={() => this.onChangeWidth('768px')}
                />
              </StepIcon>
              <StepIcon>
                <Icon
                  icon="iphone"
                  size={32}
                  onClick={() => this.onChangeWidth('450px')}
                />
              </StepIcon>
            </StepIcons>
            <div style={{ width: this.state.stepContentWidth }}>
              <div
                dangerouslySetInnerHTML={{ __html: this.state.currentTemplate }}
              />
            </div>
          </StepContent>
        </div>
      );
    } else {
      render = (
        <div>
          <StepHeader>
            <StepHeaderNumber>1</StepHeaderNumber>Choose template
          </StepHeader>

          <StepSidebar>
            {methodList}
            {messengerForm}
          </StepSidebar>
          <StepContent />
        </div>
      );
    }

    return render;
  }
}
Step1.propTypes = propTypes;
export default Step1;
