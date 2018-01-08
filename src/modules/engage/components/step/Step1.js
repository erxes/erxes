import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepHeader,
  StepHeaderNumber,
  EngageBox,
  ButtonBox,
  StepContent,
  FormHeader
} from '../../styles';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
const propTypes = {
  templates: PropTypes.array
};
class Step1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      method: 'email'
    };
  }
  onClickBox(method) {
    this.setState({ method });
  }
  render() {
    const { templates } = this.props;
    const method = this.state.method;
    const methodList = (
      <EngageBox>
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
      </EngageBox>
    );
    const templateForm = (
      <FormHeader>
        <FormGroup>
          <ControlLabel>Email template:</ControlLabel>
          <FormControl
            id="emailTemplateId"
            componentClass="select"
            onChange={this.onTemplateChange}
            defaultValue="asdfadfad"
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
    return (
      <div>
        <StepHeader>
          <StepHeaderNumber>1</StepHeaderNumber>Choose template
        </StepHeader>
        <StepContent>
          {methodList}
          {templateForm}
        </StepContent>
      </div>
    );
  }
}
Step1.propTypes = propTypes;
export default Step1;
