import { Button, FormControl, Step, Steps } from "modules/common/components";
import {
  StepWrapper,
  TitleContainer
} from "modules/common/components/step/styles";
import { Alert } from "modules/common/utils";
import { __ } from "modules/common/utils";
import { Wrapper } from "modules/layout/components";
import { IFormData } from "modules/settings/integrations/types";
import { IField } from "modules/settings/properties/types";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { IBrand } from "../../settings/brands/types";
import { IFormIntegration } from "../types";
import {
  CallOut,
  ChooseType,
  FormStep,
  FullPreviewStep,
  OptionStep,
  SuccessStep
} from "./step";

type Props = {
  integration?: IFormIntegration;
  brands: IBrand[];
  fields: IField[];
  loading?: boolean;

  save: (params: {
    name: string;
    brandId: string;
    languageCode?: string;
    formData: IFormData;
    form: any;
    fields?: IField[];
   }) => void;
};

type State = {
  activeStep?: number;
  type: string;
  brand?: string;
  language?: string;
  title?: string;
  calloutTitle?: string;
  formTitle?: string;
  bodyValue?: string;
  formDesc?: string;
  thankContent?: string;
  formBtnText?: string;
  calloutBtnText?: string;
  theme: string;
  logoPreviewUrl?: string;
  fields?: IField[];
  isSkip?: boolean;
  color: string;

  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  redirectUrl?: string;
  preview?: string;
  carousel?: string;
};

class Form extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    const integration = props.integration;

    if (!integration) {
      return;
    }

    const formData = integration.formData || {};
    const form = integration.form || {};
    const callout = form.callout || {};
    const fields = props.fields;

    this.state = {
      activeStep: 1,
      type: formData.loadType || 'shoutbox',
      brand: integration.brandId,
      language: integration.languageCode,
      title: integration.name,
      calloutTitle: callout.title || 'Title',
      formTitle: form.title || 'Contact',
      bodyValue: callout.body || '',
      formDesc: form.description || '',
      thankContent: formData.thankContent || 'Thank you.',
      formBtnText: form.buttonText || 'Send',
      calloutBtnText: callout.buttonText || 'Start',
      color: '',
      theme: form.themeColor || '#6569DF',
      logoPreviewUrl: callout.featuredImage,
      fields: fields || [],
      isSkip: callout.skip && true
    };
  }

  handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { brand, calloutTitle, title } = this.state;

    if (!title) {
      return Alert.error(__("Write title"));
    }

    if (!brand) {
      return Alert.error(__("Choose brand"));
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

  renderSaveButton() {
    const cancelButton = (
      <Link to="/forms">
        <Button btnStyle="simple" size="small" icon="cancel-1">
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
          icon="checked-1"
          onClick={this.handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  onChange(key: any, value: IField[] | string | boolean) {
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

    const formData = integration && integration.formData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __("Leads"), link: "/forms" }];
    const constant = isSkip ? "form" : "callout";

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>{__("Title")}</div>
          <FormControl
            required
            onChange={e => this.onChange("title", (e.currentTarget as HTMLInputElement).value)}
            defaultValue={title}
          />
        </TitleContainer>
        <Steps active={activeStep || 1}>
          <Step img="/images/icons/erxes-04.svg" title="Type">
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
          <Step img="/images/icons/erxes-03.svg" title="CallOut">
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
          <Step img="/images/icons/erxes-12.svg" title={"Form"}>
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
          <Step img="/images/icons/erxes-06.svg" title="Options">
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
          <Step img="/images/icons/erxes-13.svg" title="Thank content">
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
              preview={preview || "desktop"}
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

export default Form;
