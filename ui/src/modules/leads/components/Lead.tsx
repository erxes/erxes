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
import Wrapper from 'modules/layout/components/Wrapper';
import { ILeadData, ILeadIntegration } from '../types';

import React from 'react';
import { Link } from 'react-router-dom';

import { SmallLoader } from 'modules/common/components/ButtonMutate';
import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import {
  CallOut,
  ChooseType,
  FormStep,
  FullPreviewStep,
  OptionStep,
  SuccessStep
} from './step';

type Props = {
  integration?: ILeadIntegration;
  loading?: boolean;
  isActionLoading: boolean;
  isReadyToSaveForm: boolean;
  afterFormDbSave: (formId: string) => void;
  save: (
    params: {
      name: string;
      brandId: string;
      languageCode?: string;
      leadData: ILeadData;
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
  bodyValue?: string;
  calloutBtnText?: string;
  theme: string;
  isRequireOnce?: boolean;
  logoPreviewUrl?: string;
  isSkip?: boolean;
  color: string;
  logoPreviewStyle?: { opacity?: string };
  defaultValue: { [key: string]: boolean };
  logo?: string;
  rules?: IConditionsRule[];
  formData: IFormData;

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

class Lead extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as ILeadIntegration);

    const { leadData = {} as ILeadData } = integration;
    const callout = leadData.callout || {};
    const form = integration.form || {};

    this.state = {
      activeStep: 1,

      type: leadData.loadType || 'shoutbox',
      successAction: leadData.successAction || '',
      fromEmail: leadData.fromEmail || '',
      userEmailTitle: leadData.userEmailTitle || '',
      userEmailContent: leadData.userEmailContent || '',
      adminEmails: leadData.adminEmails || [],
      adminEmailTitle: leadData.adminEmailTitle || '',
      adminEmailContent: leadData.adminEmailContent || '',
      thankContent: leadData.thankContent || 'Thank you.',
      redirectUrl: leadData.redirectUrl || '',
      rules: leadData.rules || [],

      brand: integration.brandId,
      language: integration.languageCode,
      title: integration.name,
      calloutTitle: callout.title || 'Title',
      bodyValue: callout.body || '',
      calloutBtnText: callout.buttonText || 'Start',
      color: '',
      logoPreviewStyle: {},
      defaultValue: {},
      logo: '',
      formData: {
        title: form.title || '',
        desc: form.description || '',
        btnText: form.buttonText || 'Send',
        fields: [],
        type: form.type || ''
      },
      theme: leadData.themeColor || '#6569DF',
      isRequireOnce: leadData.isRequireOnce,
      logoPreviewUrl: callout.featuredImage,
      isSkip: callout.skip && true
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { brand, calloutTitle, title, rules, formData } = this.state;

    if (!title) {
      return Alert.error('Write title');
    }

    if (!formData.title) {
      return Alert.error('Write Form title');
    }

    if (!brand) {
      return Alert.error('Choose a brand');
    }

    const doc = {
      name: title,
      brandId: brand,
      languageCode: this.state.language,
      leadData: {
        loadType: this.state.type,
        successAction: this.state.successAction,
        fromEmail: this.state.fromEmail,
        userEmailTitle: this.state.userEmailTitle,
        userEmailContent: this.state.userEmailContent,
        adminEmails: this.state.adminEmails,
        adminEmailTitle: this.state.adminEmailTitle,
        adminEmailContent: this.state.adminEmailContent,
        thankContent: this.state.thankContent,
        redirectUrl: this.state.redirectUrl,
        themeColor: this.state.theme || this.state.color,
        callout: {
          title: calloutTitle,
          body: this.state.bodyValue,
          buttonText: this.state.calloutBtnText,
          featuredImage: this.state.logoPreviewUrl,
          skip: this.state.isSkip
        },
        rules: (rules || []).filter(rule => rule.condition && rule.value),
        isRequireOnce: this.state.isRequireOnce
      }
    };

    this.props.save(doc);
  };

  renderSaveButton = () => {
    const { isActionLoading } = this.props;

    const cancelButton = (
      <Link to="/leads">
        <Button btnStyle="simple" size="small" icon="cancel-1">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          disabled={isActionLoading}
          btnStyle="success"
          size="small"
          icon={isActionLoading ? undefined : 'checked-1'}
          onClick={this.handleSubmit}
        >
          {isActionLoading && <SmallLoader />}
          Save
        </Button>
      </Button.Group>
    );
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onFormDocChange = formData => {
    this.setState({ formData });
  };

  onFormInit = (fields: IField[]) => {
    const formData = this.state.formData;
    formData.fields = fields;

    this.setState({ formData });
  };

  render() {
    const {
      activeStep,
      calloutTitle,
      type,
      calloutBtnText,
      bodyValue,
      color,
      theme,
      logoPreviewUrl,
      thankContent,
      carousel,
      language,
      title,
      successAction,
      isSkip,
      rules,
      formData,
      isRequireOnce
    } = this.state;

    const { integration } = this.props;
    const leadData = integration && integration.leadData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __('Pop Ups'), link: '/leads' }];
    const constant = isSkip ? 'form' : 'callout';

    const onChange = e =>
      this.onChange('title', (e.currentTarget as HTMLInputElement).value);

    return (
      <>
        <Wrapper.Header title={__('Leads')} breadcrumb={breadcrumb} />
        <StepWrapper>
          <TitleContainer>
            <div>{__('Title')}</div>
            <FormControl
              required={true}
              onChange={onChange}
              defaultValue={title}
              autoFocus={true}
            />
            {this.renderSaveButton()}
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
                type={type}
                color={color}
                theme={theme}
                formId={integration && integration.formId}
                formData={formData}
                afterDbSave={this.props.afterFormDbSave}
                onDocChange={this.onFormDocChange}
                onInit={this.onFormInit}
                isReadyToSaveForm={this.props.isReadyToSaveForm}
              />
            </Step>
            <Step img="/images/icons/erxes-02.svg" title="Rule">
              <ConditionsRule rules={rules || []} onChange={this.onChange} />
            </Step>
            <Step img="/images/icons/erxes-06.svg" title="Options">
              <OptionStep
                onChange={this.onChange}
                type={type}
                color={color}
                brand={brand}
                theme={theme}
                isRequireOnce={isRequireOnce}
                language={language}
                formData={formData}
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
                leadData={leadData}
                formId={integration && integration.formId}
              />
            </Step>
            <Step
              img="/images/icons/erxes-19.svg"
              title="Full Preview"
              noButton={true}
            >
              <FullPreviewStep
                onChange={this.onChange}
                calloutTitle={calloutTitle}
                calloutBtnText={calloutBtnText}
                bodyValue={bodyValue}
                type={type}
                color={color}
                theme={theme}
                image={logoPreviewUrl}
                thankContent={thankContent}
                skip={isSkip}
                carousel={carousel || constant}
                formData={formData}
              />
            </Step>
          </Steps>
        </StepWrapper>
      </>
    );
  }
}

export default Lead;
