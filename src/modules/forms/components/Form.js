import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Alert } from 'modules/common/utils';
import { Button, Icon, FormControl } from 'modules/common/components';
import {
  ChooseType,
  CallOut,
  SuccessStep,
  OptionStep,
  FormStep,
  FullPreviewStep,
  Step,
  Steps
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
  constructor(props, context) {
    super(props, context);

    const { __ } = context;
    const integration = props.integration || {};
    const formData = integration && (integration.formData || {});
    const form = integration && (integration.form || {});
    const callout = form.callout || {};
    const fields = props.fields || [];

    this.state = {
      activeStep: 1,
      maxStep: 6,
      type: formData.loadType || 'shoutbox',
      brand: integration.brandId,
      language: integration.languageCode,
      title: integration.name,
      calloutTitle: callout.title || __('Title'),
      formTitle: form.title || __('Contact'),
      bodyValue: callout.body || '',
      formDesc: form.description || '',
      thankContent: formData.thankContent || __('Thank you.'),
      formBtnText: form.buttonText || __('Send'),
      calloutBtnText: callout.buttonText || 'Start',
      theme: form.themeColor || '#6569DF',
      logoPreviewUrl: callout.featuredImage,
      fields: fields || [],
      isSkip: callout.skip || false
    };

    this.next = this.next.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { brand, calloutTitle, title } = this.state;
    const { __ } = this.context;

    if (!title) {
      return Alert.error(__('Write title'));
    }

    if (!brand) {
      return Alert.error(__('Choose brand'));
    }

    this.props.save({
      name: title,
      brandId: brand,
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
        title: this.state.formTitle,
        description: this.state.formDesc,
        buttonText: this.state.formBtnText,
        themeColor: this.state.theme || this.state.color,
        callout: {
          title: calloutTitle,
          body: this.state.bodyValue,
          buttonText: this.state.calloutBtnText,
          featuredImage: this.state.logoPreviewUrl,
          skip: this.state.isSkip
        }
      },
      fields: this.state.fields
    });
  }

  renderNextButton() {
    const { __ } = this.context;

    return (
      <Button btnStyle="primary" size="small" onClick={() => this.next(0)}>
        {__('Next')} <Icon icon="ios-arrow-forward" />
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
      formTitle,
      type,
      calloutBtnText,
      bodyValue,
      formDesc,
      color,
      theme,
      logoPreviewUrl,
      thankContent,
      fields,
      preview,
      carousel,
      language,
      title,
      successAction,
      formBtnText,
      isSkip
    } = this.state;

    const { integration, brands } = this.props;
    const { __ } = this.context;

    const formData = integration && integration.formData;
    const brand = integration && (integration.brand || {});
    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];
    const constant = isSkip ? 'form' : 'callout';

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required
            onChange={e => this.onChange('title', e.target.value)}
            defaultValue={title}
          />
        </TitleContainer>

        <Steps active={activeStep}>
          <Step
            img="/images/icons/erxes-04.svg"
            title="Type"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <ChooseType
              onChange={this.onChange}
              type={type}
              calloutTitle={calloutTitle}
              calloutBtnText={calloutBtnText}
              bodyValue={bodyValue}
              color={color}
              theme={theme}
            />
          </Step>

          <Step
            img="/images/icons/erxes-03.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut
              onChange={this.onChange}
              type={type}
              calloutTitle={calloutTitle}
              calloutBtnText={calloutBtnText}
              bodyValue={bodyValue}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
              skip={isSkip}
            />
          </Step>
          <Step
            img="/images/icons/erxes-12.svg"
            title="Form"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <FormStep
              onChange={this.onChange}
              formTitle={formTitle}
              formBtnText={formBtnText}
              formDesc={formDesc}
              type={type}
              color={color}
              theme={theme}
              fields={fields}
            />
          </Step>
          <Step
            img="/images/icons/erxes-06.svg"
            title="Options"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <OptionStep
              onChange={this.onChange}
              formTitle={formTitle}
              formBtnText={formBtnText}
              formDesc={formDesc}
              type={type}
              color={color}
              brand={brand}
              theme={theme}
              brands={brands}
              fields={fields}
              language={language}
            />
          </Step>
          <Step
            img="/images/icons/erxes-13.svg"
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
            img="/images/icons/erxes-14.svg"
            title="Full Preview"
            next={this.next}
            nextButton={this.renderSaveButton()}
          >
            <FullPreviewStep
              onChange={this.onChange}
              calloutTitle={calloutTitle}
              formTitle={formTitle}
              formBtnText={formBtnText}
              calloutBtnText={calloutBtnText}
              bodyValue={bodyValue}
              formDesc={formDesc}
              type={type}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
              fields={fields}
              preview={preview || 'desktop'}
              thankContent={thankContent}
              skip={isSkip}
              carousel={carousel || constant}
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
