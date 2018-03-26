import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormGroup } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview, Title } from './style';

const propTypes = {
  type: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  thankContent: PropTypes.string,
  successAction: PropTypes.string,
  onChange: PropTypes.func,
  formData: PropTypes.object
};

class SuccessStep extends Component {
  constructor(props) {
    super(props);

    const formData = props.formData || [];

    this.state = {
      successAction: formData.successAction
    };

    this.renderPreview = this.renderPreview.bind(this);
    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.handleSuccessActionChange = this.handleSuccessActionChange.bind(this);
  }

  handleSuccessActionChange() {
    const value = document.getElementById('successAction').value;

    this.setState({ successAction: value });
    this.props.onChange('successAction', value);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
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
              onChange={e => this.onChangeFunction('fromEmail', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('User email title')}</Title>
            <FormControl
              type="text"
              id="userEmailTitle"
              defaultValue={formData.userEmailTitle}
              onChange={e =>
                this.onChangeFunction('userEmailTitle', e.target.value)
              }
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('User email content')}</Title>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.userEmailContent}
              id="userEmailContent"
              onChange={e =>
                this.onChangeFunction('userEmailContent', e.target.value)
              }
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin emails')}</Title>
            <FormControl
              type="text"
              defaultValue={formData.adminEmails}
              id="adminEmails"
              onChange={e =>
                this.onChangeFunction('adminEmails', e.target.value)
              }
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin email title')}</Title>
            <FormControl
              type="text"
              defaultValue={formData.adminEmailTitle}
              id="adminEmailTitle"
              onChange={e =>
                this.onChangeFunction('adminEmailTitle', e.target.value)
              }
            />
          </FormGroup>

          <FormGroup>
            <Title>{__('Admin email content')}</Title>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.adminEmailContent}
              id="adminEmailContent"
              onChange={e =>
                this.onChangeFunction('adminEmailContent', e.target.value)
              }
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
              onChange={e =>
                this.onChangeFunction('redirectUrl', e.target.value)
              }
            />
          </FormGroup>
        </div>
      );
    }
  }

  renderPreview() {
    const { type } = this.props;

    if (type === 'shoutbox') {
      return <ShoutboxPreview {...this.props} />;
    }

    if (type === 'popup') {
      return <PopupPreview {...this.props} />;
    }

    return <EmbeddedPreview {...this.props} />;
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
            defaultValue={formData.successAction}
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
            id="thankContent"
            type="text"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={e =>
              this.onChangeFunction('thankContent', e.target.value)
            }
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
