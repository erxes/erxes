import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Button, Icon, FormControl } from 'modules/common/components';
import _ from 'lodash';
import {
  ChooseType,
  Steps,
  Step,
  CallOut,
  SuccessStep,
  OptionStep,
  FormStep,
  FullPreviewStep
} from './step';
import { StepWrapper, TitleContainer } from '../styles';

const propTypes = {
  integration: PropTypes.object,
  brands: PropTypes.array,
  forms: PropTypes.array,
  fields: PropTypes.array,
  loading: PropTypes.bool
};

class Form extends Component {
  constructor(props) {
    super(props);

    const integration = props.integration || {};
    const formData = integration.formData || {};
    const fields = props.fields || [];

    console.log(integration, fields);
    this.state = {
      activeStep: 1,
      maxStep: 5,
      kind: formData.loadType || 'shoutbox',
      preview: 'desktop',
      title: integration.name || 'Contact',
      bodyValue: 'Body description here',
      thankContent: formData.thankContent || 'Thank you.',
      successAction: formData.successAction || 'onPage',
      btnText: 'Send',
      fields: fields || [],
      color: '#04A9F5',
      theme: '',
      logoPreviewUrl: '',
      validate: {
        step1: false,
        step2: true,
        step3: true
      }
    };

    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
  }

  renderNextButton() {
    return (
      <Button btnStyle="primary" size="small" onClick={() => this.next(0)}>
        Next <Icon icon="ios-arrow-forward" />
      </Button>
    );
  }

  renderSaveButton() {
    const cancelButton = (
      <Link to="/engage">
        <Button btnStyle="simple" size="small" icon="close">
          Cancel
        </Button>
      </Link>
    );

    if (!_.isEmpty()) {
      return (
        <Button.Group>
          {cancelButton}
          <Button
            btnStyle="primary"
            size="small"
            icon="checkmark"
            onClick={e => this.save('save', e)}
          >
            Save
          </Button>
        </Button.Group>
      );
    }
    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          size="small"
          icon="checkmark"
          onClick={e => this.save('live', e)}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;

    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const {
      activeStep,
      title,
      kind,
      btnText,
      bodyValue,
      color,
      theme,
      options,
      logoPreviewUrl,
      thankContent,
      fields,
      preview,
      successAction
    } = this.state;
    const { integration } = this.props;
    const { __ } = this.context;

    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>Title</div>
          <FormControl
            required
            onChange={e => this.changeState('title', e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <Steps active={activeStep}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Type"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <ChooseType changeState={this.changeState} kind={kind} />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut
              changeState={this.changeState}
              kind={kind}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Form"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <FormStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              options={options}
              image={logoPreviewUrl}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Options"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <OptionStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              options={options}
              image={logoPreviewUrl}
              brands={this.props.brands}
              fields={fields}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Thank content"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <SuccessStep
              key={integration._id}
              changeState={this.changeState}
              thankContent={thankContent}
              kind={kind}
              color={color}
              theme={theme}
              successAction={successAction}
              formData={integration.formData}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Full Preview"
            next={this.next}
            nextButton={this.renderSaveButton()}
          >
            <FullPreviewStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
              fields={fields}
              preview={preview}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = {
  __: PropTypes.func
};

export default Form;
