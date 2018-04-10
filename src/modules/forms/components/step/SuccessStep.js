import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { SuccessPreview } from './preview';
import { FlexItem, LeftItem, Preview } from './style';

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
      successAction: formData.successAction || 'onPage'
    };

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

  renderEmailFields(formData) {
    if (this.state.successAction === 'email') {
      return (
        <div>
          <FormGroup>
            <ControlLabel>From email</ControlLabel>
            <FormControl
              type="text"
              id="fromEmail"
              defaultValue={formData.fromEmail}
              onChange={e => this.onChangeFunction('fromEmail', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>User email title</ControlLabel>
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
            <ControlLabel>User email content</ControlLabel>
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
            <ControlLabel>Admin emails</ControlLabel>
            <FormControl
              id="adminEmails"
              type="text"
              defaultValue={formData.adminEmails.join(',')}
              onChange={e =>
                this.onChangeFunction('adminEmails', e.target.value)
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Admin email title</ControlLabel>
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
            <ControlLabel>Admin email content</ControlLabel>
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

  renderRedirectUrl(formData) {
    if (this.state.successAction === 'redirect') {
      return (
        <div>
          <FormGroup>
            <ControlLabel>Redirect url</ControlLabel>
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

  renderThankContent() {
    const { thankContent } = this.props;
    const { successAction } = this.state;

    if (successAction === 'onPage') {
      return (
        <FormGroup>
          <ControlLabel>Thank content</ControlLabel>
          <FormControl
            id="thankContent"
            type="text"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={e =>
              this.onChangeFunction('thankContent', e.target.value)
            }
          />
        </FormGroup>
      );
    }
  }

  render() {
    const formData = this.props.formData || {};
    const { successAction } = this.state;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>On success</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={successAction}
              onChange={this.handleSuccessActionChange}
              id="successAction"
            >
              <option />
              <option>email</option>
              <option>redirect</option>
              <option>onPage</option>
            </FormControl>
          </FormGroup>

          {this.renderEmailFields(formData)}
          {this.renderRedirectUrl(formData)}
          {this.renderThankContent()}
        </LeftItem>

        <Preview>
          <SuccessPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

SuccessStep.propTypes = propTypes;
SuccessStep.contextTypes = {
  __: PropTypes.func
};

export default SuccessStep;
