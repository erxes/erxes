import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ConditionsRule from 'modules/common/components/rule/ConditionsRule';
import { Step, Steps } from 'modules/common/components/step';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { IConditionsRule } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { IFormIntegration } from 'modules/forms/types';
import Wrapper from 'modules/layout/components/Wrapper';
import { IFormData } from 'modules/settings/integrations/types';
import { IField } from 'modules/settings/properties/types';

import React from 'react';
import { Link } from 'react-router-dom';

import {
  CallOut,
  ChooseType,
  FormStep,
  FullPreviewStep,
  OptionStep,
  SuccessStep
} from './step';

type Props = {
  integration?: IFormIntegration;
  fields: IField[];
  loading?: boolean;

  save: (
    params: {
      name: string;
      brandId: string;
      languageCode?: string;
      formData: IFormData;
      form: any;
      fields?: IField[];
    }
  ) => void;
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
  formBtnText?: string;
  calloutBtnText?: string;
  theme: string;
  logoPreviewUrl?: string;
  fields?: IField[];
  isSkip?: boolean;
  color: string;
  logoPreviewStyle?: { opacity?: string };
  defaultValue: { [key: string]: boolean };
  logo?: string;
  rules?: IConditionsRule[];

  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
  carousel?: string;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IFormIntegration);

    const formData = integration.formData || ({} as IFormData);
    const form = integration.form || {};
    const callout = form.callout || {};
    const fields = props.fields;

    this.state = {
      activeStep: 1,

      type: formData.loadType || 'shoutbox',
      successAction: formData.successAction || '',
      fromEmail: formData.fromEmail || '',
      userEmailTitle: formData.userEmailTitle || '',
      userEmailContent: formData.userEmailContent || '',
      adminEmails: formData.adminEmails || [],
      adminEmailTitle: formData.adminEmailTitle || '',
      adminEmailContent: formData.adminEmailContent || '',
      thankContent: formData.thankContent || 'Thank you.',
      redirectUrl: formData.redirectUrl || '',
      rules: integration.form ? integration.form.rules : [],

      brand: integration.brandId,
      language: integration.languageCode,
      title: integration.name,
      calloutTitle: callout.title || 'Title',
      formTitle: form.title || '',
      bodyValue: callout.body || '',
      formDesc: form.description || '',
      formBtnText: form.buttonText || 'Send',
      calloutBtnText: callout.buttonText || 'Start',
      color: '',
      logoPreviewStyle: {},
      defaultValue: {},
      logo: '',
      theme: form.themeColor || '#6569DF',
      logoPreviewUrl: callout.featuredImage,
      fields: fields || [],
      isSkip: callout.skip && true
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { brand, calloutTitle, title, rules } = this.state;

    if (!title) {
      return Alert.error('Write title');
    }

    if (!brand) {
      return Alert.error('Choose a brand');
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
        },
        rules: (rules || []).map(rule => ({
          _id: rule._id,
          kind: rule.kind,
          text: rule.text,
          condition: rule.condition,
          value: rule.value
        }))
      },
      fields: this.state.fields
    });
  };

  renderSaveButton = () => {
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
  };

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as Pick<State, keyof State>);
  };

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
      carousel,
      language,
      title,
      successAction,
      formBtnText,
      isSkip,
      rules
    } = this.state;

    const { integration } = this.props;

    const formData = integration && integration.formData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __('Leads'), link: '/forms' }];
    const constant = isSkip ? 'form' : 'callout';

    const onChange = e =>
      this.onChange('title', (e.currentTarget as HTMLInputElement).value);

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Leads')} breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required={true}
            onChange={onChange}
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
          <Step img="/images/icons/erxes-12.svg" title={'Form'}>
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
          <Step img="/images/icons/erxes-02.svg" title="Rule">
            <ConditionsRule rules={rules || []} onChange={this.onChange} />
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
            img="/images/icons/erxes-19.svg"
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
