import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormGroup } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview, Title } from './style';

const propTypes = {
  kind: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  thankContent: PropTypes.string,
  successAction: PropTypes.string,
  changeState: PropTypes.func,
  formData: PropTypes.object
};

class SuccessStep extends Component {
  constructor(props) {
    super(props);

    const formData = props.formData || {};

    this.state = {
      successAction: formData.successAction
    };

    this.onChangeContent = this.onChangeContent.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.handleSuccessActionChange = this.handleSuccessActionChange.bind(this);
  }

  handleSuccessActionChange() {
    this.setState({
      successAction: document.getElementById('successAction').value
    });

    this.props.changeState('successAction', this.state.successAction);
  }

  onChangeContent(value) {
    this.setState({ thankContent: value });
    this.props.changeState('thankContent', value);
  }

  renderEmailFields(formData, __) {
    if (this.state.successAction === 'email') {
      return (
        <div>
          <FormGroup>
            <Title>{__('From email')}</Title>
            <FormControl
              type="text"
              id="fromEmail"
              defaultValue={formData.fromEmail}
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('User email title')}</Title>
            <FormControl
              type="text"
              id="userEmailTitle"
              defaultValue={formData.userEmailTitle}
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('User email content')}</Title>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.userEmailContent}
              id="userEmailContent"
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin emails')}</Title>
            <FormControl
              type="text"
              defaultValue={formData.adminEmails}
              id="adminEmails"
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin email title')}</Title>
            <FormControl
              type="text"
              defaultValue={formData.adminEmailTitle}
              id="adminEmailTitle"
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin email content')}</Title>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.adminEmailContent}
              id="adminEmailContent"
            />
          </FormGroup>
        </div>
      );
    }
  }

  renderRedirectUrl(formData, __) {
    if (this.state.successAction === 'redirect') {
      return (
        <div>
          <FormGroup>
            <Title>{__('Redirect url')}</Title>
            <FormControl
              type="text"
              defaultValue={formData.redirectUrl}
              id="redirectUrl"
            />
          </FormGroup>
        </div>
      );
    }
  }

  renderPreview() {
    const { kind, color, theme, thankContent } = this.props;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          color={color}
          theme={theme}
          thankContent={thankContent}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview color={color} theme={theme} thankContent={thankContent} />
      );
    }
    return (
      <EmbeddedPreview
        color={color}
        theme={theme}
        thankContent={thankContent}
      />
    );
  }

  render() {
    const { __ } = this.context;
    const { thankContent } = this.props;
    const formData = this.props.formData || {};

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('On success')}</Title>
          <FormControl
            componentClass="select"
            defaultValue=""
            onChange={this.handleSuccessActionChange}
            id="successAction"
          >
            <option />
            <option>email</option>
            <option>redirect</option>
            <option>onPage</option>
          </FormControl>

          {this.renderEmailFields(formData, __)}
          {this.renderRedirectUrl(formData, __)}

          <Title>{__('Thank content')}</Title>
          <FormControl
            id="description"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={e => this.onChangeContent(e.target.value)}
          />
        </LeftItem>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

SuccessStep.propTypes = propTypes;
SuccessStep.contextTypes = {
  __: PropTypes.func
};

export default SuccessStep;
