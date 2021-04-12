import Button from 'modules/common/components/Button';
import ConditionsRule from 'modules/common/components/rule/ConditionsRule';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'modules/common/components/step/styles';
import { IConditionsRule } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { ILeadData, ILeadIntegration } from '../types';

import { SmallLoader } from 'modules/common/components/ButtonMutate';
import { IFormData } from 'modules/forms/types';
import { Content, LeftContent } from 'modules/settings/integrations/styles';
import { IField } from 'modules/settings/properties/types';
import {
  CallOut,
  ChooseType,
  FormStep,
  FullPreview,
  OptionStep,
  SuccessStep
} from './step';
import { PreviewWrapper } from './step/style';

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
  isStepActive: boolean;
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
  templateId?: string;
  carousel: string;

  currentMode: 'create' | 'update' | undefined;
  currentField?: IField;
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
      isStepActive: false,

      brand: integration.brandId,
      channelIds: channels.map(item => item._id) || [],
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
      isSkip: callout.skip && true,
      carousel: callout.skip ? 'form' : 'callout',

      currentMode: undefined,
      currentField: undefined
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
      channelIds
    } = this.state;

    if (!title) {
      return Alert.error('Enter a Form name');
    }

    if (!formData.title) {
      return Alert.error('Enter a Form title');
    }

    if (!brand) {
      return Alert.error('Choose a Brand');
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
        templateId: this.state.templateId,
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

  onFieldClick = (field: IField) => {
    this.setState({ currentMode: 'update', currentField: field });
  };

  onStepClick = currentStepNumber => {
    const { isSkip } = this.state;

    let carousel = 'form';
    switch (currentStepNumber) {
      case 1:
        carousel = isSkip ? 'form' : 'callout';
        break;
      case 2:
        carousel = isSkip ? 'form' : 'callout';
        break;
      case 6:
        carousel = 'success';
        break;
    }
    return this.setState({ carousel });
  };

  renderButtons = () => {
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

  render() {
    const {
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
      channelIds
    } = this.state;

    const { integration, emailTemplates } = this.props;
    const leadData = integration && integration.leadData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Forms')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-04.svg"
                title="Style"
                onClick={this.onStepClick}
              >
                <ChooseType
                  onChange={this.onChange}
                  type={type}
                  calloutTitle={calloutTitle}
                  calloutBtnText={calloutBtnText}
                  color={color}
                  theme={theme}
                />
              </Step>
              <Step
                img="/images/icons/erxes-03.svg"
                title="CallOut"
                onClick={this.onStepClick}
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
                title={'Content'}
                onClick={this.onStepClick}
              >
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
                  currentMode={this.state.currentMode}
                  currentField={this.state.currentField}
                />
              </Step>
              <Step
                img="/images/icons/erxes-02.svg"
                title="Rule"
                onClick={this.onStepClick}
              >
                <ConditionsRule rules={rules || []} onChange={this.onChange} />
              </Step>
              <Step
                img="/images/icons/erxes-06.svg"
                title="Options"
                onClick={this.onStepClick}
              >
                <OptionStep
                  title={title}
                  type={type}
                  color={color}
                  brand={brand}
                  theme={theme}
                  language={language}
                  formData={formData}
                  isRequireOnce={isRequireOnce}
                  channelIds={channelIds}
                  onChange={this.onChange}
                />
              </Step>
              <Step
                img="/images/icons/erxes-13.svg"
                title="Confirmation"
                onClick={this.onStepClick}
                noButton={true}
              >
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
            </Steps>
            <ControlWrapper>
              <Indicator>
                {__('You are')} {integration ? 'editing' : 'creating'}{' '}
                <strong>{title}</strong> {__('form')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>

          <PreviewWrapper>
            <FullPreview
              onChange={this.onChange}
              onDocChange={this.onFormDocChange}
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
              carousel={carousel}
              formData={formData}
            />
          </PreviewWrapper>
        </Content>
      </StepWrapper>
    );
  }
}

export default Lead;
