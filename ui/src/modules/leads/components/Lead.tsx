import Button from 'modules/common/components/Button';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import FormControl from 'modules/common/components/form/Control';
import ConditionsRule from 'modules/common/components/rule/ConditionsRule';
import { Step, Steps } from 'modules/common/components/step';
import { StepWrapper, TitleContainer } from 'modules/common/components/step/styles';
import { IConditionsRule } from 'modules/common/types';
import { Alert, __ } from 'modules/common/utils';
import { IFormData } from 'modules/forms/types';
import Wrapper from 'modules/layout/components/Wrapper';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { ILeadData, ILeadIntegration } from '../types';
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
  emailTemplates?: IEmailTemplate[];
  afterFormDbSave: (formId: string) => void;
  save: (params: {
    name: string;
    brandId: string;
    languageCode?: string;
    leadData: ILeadData;
    channelIds?: string[];
  }) => void;
};

type State = {
  activeStep?: number;
  type: string;
  brand?: string;
  channelIds?: string[];
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
  thankTitle?: string;
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
    const channels = integration.channels || [];

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
      thankTitle: leadData.thankTitle || 'Title',
      thankContent: leadData.thankContent || 'Thank you.',
      redirectUrl: leadData.redirectUrl || '',
      rules: leadData.rules || [],

      brand: integration.brandId,
      channelIds: channels.map((item) => item._id) || [],
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
        type: form.type || '',
      },
      theme: leadData.themeColor || '#6569DF',
      isRequireOnce: leadData.isRequireOnce,
      logoPreviewUrl: callout.featuredImage,
      isSkip: callout.skip && true,
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      brand,
      calloutTitle,
      title,
      rules,
      formData,
      channelIds,
    } = this.state;

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
      channelIds,
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
        thankTitle: this.state.thankTitle,
        thankContent: this.state.thankContent,
        redirectUrl: this.state.redirectUrl,
        themeColor: this.state.theme || this.state.color,
        callout: {
          title: calloutTitle,
          body: this.state.bodyValue,
          buttonText: this.state.calloutBtnText,
          featuredImage: this.state.logoPreviewUrl,
          skip: this.state.isSkip,
        },
        rules: (rules || []).filter((rule) => rule.condition && rule.value),
        isRequireOnce: this.state.isRequireOnce,
      },
    };

    this.props.save(doc);
  };

  renderSaveButton = () => {
    const { isActionLoading } = this.props;

    const cancelButton = (
      <Link to="/forms">
        <Button btnStyle="simple" icon="times-circle" uppercase={false}>
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
          uppercase={false}
          icon={isActionLoading ? undefined : 'check-circle'}
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

  onFormDocChange = (formData) => {
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
      thankTitle,
      thankContent,
      carousel,
      language,
      title,
      successAction,
      isSkip,
      rules,
      formData,
      isRequireOnce,
      channelIds,
    } = this.state;

    const { integration, emailTemplates } = this.props;
    const leadData = integration && integration.leadData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];
    const constant = isSkip ? 'form' : 'callout';

    const onChange = (e) =>
      this.onChange('title', (e.currentTarget as HTMLInputElement).value);

    return (
      <>
        <Wrapper.Header title={__('Forms')} breadcrumb={breadcrumb} />
        <StepWrapper>
          <TitleContainer id="CreatePopupsTitle">
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
            <Step img="/images/icons/erxes-04.svg" title="Style">
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
            <Step img="/images/icons/erxes-12.svg" title={'Content'}>
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
                channelIds={channelIds}
              />
            </Step>
            <Step img="/images/icons/erxes-13.svg" title="Confirmation">
              <SuccessStep
                onChange={this.onChange}
                thankTitle={thankTitle}
                thankContent={thankContent}
                type={type}
                color={color}
                theme={theme}
                successAction={successAction}
                leadData={leadData}
                formId={integration && integration.formId}
                emailTemplates={emailTemplates ? emailTemplates : []}
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
                thankTitle={thankTitle}
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
