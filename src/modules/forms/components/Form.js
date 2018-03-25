import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Button, Icon, FormControl } from 'modules/common/components';
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
  fields: PropTypes.array,
  loading: PropTypes.bool,
  save: PropTypes.func
};

class Form extends Component {
  constructor(props) {
    super(props);

    const integration = props.integration || {};
    const formData = integration && (integration.formData || {});
    const form = integration && (integration.form || {});
    const fields = props.fields || [];

    this.state = {
      activeStep: 1,
      maxStep: 6,
      type: formData.loadType || 'shoutbox',
      preview: 'desktop',
      title: integration.name || '',
      calloutTitle: form.title || 'Contact',
      bodyValue: form.description || 'Body description here',
      thankContent: formData.thankContent || 'Thank you.',
      btnText: form.buttonText || 'Send',
      fields: fields || []
    };

    this.next = this.next.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      title: this.state.title,
      brandId: this.state.brand,
      languageCode: this.state.language,
      formData: {
        loadType: this.state.type,
        successAction: this.state.successAction,
        fromEmail: this.state.fromEmail,
        userEmailTitle: this.state.userEmailTitle,
        userEmailContent: this.state.userEmailContent,
        adminEmails: this.state.adminEmails,
        adminEmailTitle: this.state.adminEmailTitle,
        adminEmailContent: this.state.adminEmailContent,
        thankContent: this.state.thankContent,
        redirectUrl: this.state.redirectUrl
      },
      form: {
        title: this.state.calloutTitle,
        description: this.state.bodyValue,
        buttonText: this.state.btnText,
        themeColor: this.state.theme || this.state.color,
        featuredImage: this.state.logoPreviewUrl,
        fields: this.state.fields
      }
    });
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
      <Link to="/forms">
        <Button btnStyle="simple" size="small" icon="close">
          Cancel
        </Button>
      </Link>
    );
    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          size="small"
          icon="checkmark"
          onClick={this.handleSubmit}
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

  onChange(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const {
      activeStep,
      calloutTitle,
      type,
      btnText,
      bodyValue,
      color,
      theme,
      logoPreviewUrl,
      thankContent,
      fields,
      preview,
      carousel,
      successAction
    } = this.state;

    const { integration, brands } = this.props;

    const { __ } = this.context;
    const formData = integration && integration.formData;
    const brand = integration && (integration.brand || {});
    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>Title</div>
          <FormControl
            required
            onChange={e => this.onChange('title', e.target.value)}
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
            <ChooseType
              onChange={this.onChange}
              type={type}
              calloutTitle={calloutTitle}
              btnText={btnText}
              bodyValue={bodyValue}
              color={color}
            />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut
              onChange={this.onChange}
              type={type}
              calloutTitle={calloutTitle}
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
              onChange={this.onChange}
              calloutTitle={calloutTitle}
              btnText={btnText}
              bodyValue={bodyValue}
              type={type}
              color={color}
              theme={theme}
              fields={fields}
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
              onChange={this.onChange}
              calloutTitle={calloutTitle}
              btnText={btnText}
              bodyValue={bodyValue}
              type={type}
              color={color}
              brand={brand}
              theme={theme}
              image={logoPreviewUrl}
              brands={brands}
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
              onChange={this.onChange}
              thankContent={thankContent}
              type={type}
              color={color}
              theme={theme}
              successAction={successAction}
              formData={formData}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Full Preview"
            next={this.next}
            nextButton={this.renderSaveButton()}
          >
            <FullPreviewStep
              onChange={this.onChange}
              calloutTitle={calloutTitle}
              btnText={btnText}
              bodyValue={bodyValue}
              type={type}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
              fields={fields}
              preview={preview}
              thankContent={thankContent}
              carousel={carousel || 'callout'}
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
