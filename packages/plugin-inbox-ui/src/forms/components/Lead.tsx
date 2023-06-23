import {
  CallOut,
  ChooseType,
  FormStep,
  FullPreview,
  OptionStep,
  SuccessStep
} from './step';
import { IAttachment, IConditionsRule } from '@erxes/ui/src/types';
import { ILeadData, ILeadIntegration } from '@erxes/ui-leads/src/types';
import { Step, Steps } from '@erxes/ui/src/components/step';

import { Alert } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import ConditionsRule from '@erxes/ui/src/components/rule/ConditionsRule';
import { Content } from '@erxes/ui-inbox/src/settings/integrations/styles';
import { ControlWrapper } from '@erxes/ui/src/components/step/styles';
import { IConfig } from '@erxes/ui-settings/src/general/types';
import { IField } from '@erxes/ui/src/types';
import { IFormData } from '@erxes/ui-forms/src/forms/types';
import { Indicator } from '@erxes/ui/src/components/step/styles';
import { LeftContent } from '@erxes/ui-inbox/src/settings/integrations/styles';
import { Link } from 'react-router-dom';
import { PreviewWrapper } from '@erxes/ui/src/components/step/style';
import React from 'react';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import StyleSheetStep from './step/StyleSheetStep';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  integration?: ILeadIntegration;
  integrationId?: string;
  loading?: boolean;
  isActionLoading: boolean;
  isReadyToSaveForm: boolean;
  configs: IConfig[];
  emailTemplates?: any[] /*change type*/;
  afterFormDbSave: (formId: string) => void;
  save: (params: {
    name: string;
    brandId: string;
    languageCode?: string;
    leadData: ILeadData;
    channelIds?: string[];
    visibility?: string;
    departmentIds?: string[];
  }) => void;
  onChildProcessFinished?: (component: string) => void;
  waitUntilFinish?: (obj: any) => void;
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
  saveAsCustomer?: boolean;
  isSkip?: boolean;
  color: string;
  logoPreviewStyle?: { opacity?: string };
  defaultValue: { [key: string]: boolean };
  logo?: string;
  calloutImgSize?: string;
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
  attachments?: IAttachment[];

  currentMode: 'create' | 'update' | undefined;
  currentField?: IField;
  css?: string;

  successImage?: string;
  successPreviewStyle?: { opacity?: string };
  successImageSize?: string;
  departmentIds?: string[];
  visibility?: string;
};

class Lead extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // ILeadIntegration
    const integration = props.integration || ({} as any);

    const { leadData = {} as ILeadData } = integration;
    const callout = leadData.callout || {};
    const form = integration.form || ({} as any);
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
      thankTitle: leadData.thankTitle || 'Confirmation',
      thankContent: leadData.thankContent || 'Thank you.',
      attachments: leadData.attachments || [],
      redirectUrl: leadData.redirectUrl || '',
      rules: leadData.rules || [],
      isStepActive: false,

      brand: integration.brandId,
      channelIds: channels.map(item => item._id) || [],
      language: integration.languageCode,
      title: integration.name || 'Create Form',
      calloutTitle: callout.title || 'Call Out Title',
      bodyValue: callout.body || 'Call Out Body',
      calloutBtnText: callout.buttonText || 'Start',
      color: '',
      logoPreviewStyle: {},
      defaultValue: {},
      formData: {
        title: form.title || 'Form Title',
        description: form.description || 'Form Description',
        buttonText: form.buttonText || 'Send',
        fields: form.fields || [],
        type: form.type || '',
        numberOfPages: form.numberOfPages || 1
      },
      theme: leadData.themeColor || '#6569DF',
      isRequireOnce: leadData.isRequireOnce,
      saveAsCustomer: leadData.saveAsCustomer,
      logo: callout.featuredImage,
      calloutImgSize: callout.imgSize || '50%',
      isSkip: callout.skip && true,
      carousel: callout.skip ? 'form' : 'callout',

      currentMode: undefined,
      currentField: undefined,
      css: leadData.css || '',

      successImage: leadData.successImage || '',
      successImageSize: leadData.successImageSize || '',
      successPreviewStyle: {},
      departmentIds: integration.departmentIds || [],
      visibility: integration.visibility || 'public'
    };
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.formData !== this.state.formData) {
      this.setState({ formData: this.state.formData });
    }
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
      departmentIds,
      visibility
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
      departmentIds,
      visibility,
      leadData: {
        loadType: this.state.type,
        successAction: this.state.successAction,
        fromEmail: this.state.fromEmail,
        userEmailTitle: this.state.userEmailTitle,
        userEmailContent: this.state.userEmailContent,
        adminEmails: this.state.adminEmails,
        adminEmailTitle: this.state.adminEmailTitle,
        adminEmailContent: this.state.adminEmailContent,
        attachments: this.state.attachments,
        thankTitle: this.state.thankTitle,
        thankContent: this.state.thankContent,
        redirectUrl: this.state.redirectUrl,
        themeColor: this.state.theme || this.state.color,
        templateId: this.state.templateId,
        callout: {
          title: calloutTitle,
          body: this.state.bodyValue,
          buttonText: this.state.calloutBtnText,
          featuredImage: this.state.logo,
          calloutImgSize: this.state.calloutImgSize,
          skip: this.state.isSkip
        },
        rules: (rules || []).filter(rule => rule.condition && rule.value),
        isRequireOnce: this.state.isRequireOnce,
        saveAsCustomer: this.state.saveAsCustomer,
        css: this.state.css,
        successImage: this.state.successImage,
        successImageSize: this.state.successImageSize
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
      case 7:
        carousel = 'success';
        break;
    }
    return this.setState({ carousel });
  };

  renderButtons = () => {
    const { isActionLoading } = this.props;

    const cancelButton = (
      <Link to="/forms">
        <Button btnStyle="simple" icon="times-circle">
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
      logo,
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
      saveAsCustomer,
      channelIds,
      css,
      calloutImgSize,
      successImage,
      successImageSize,
      successPreviewStyle,
      departmentIds,
      visibility
    } = this.state;

    const { integration = {} as any, emailTemplates, configs } = this.props;
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
                  calloutImgSize={calloutImgSize}
                  bodyValue={bodyValue}
                  color={color}
                  theme={theme}
                  image={logo}
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
                  formData={this.state.formData}
                  isRequireOnce={isRequireOnce}
                  saveAsCustomer={saveAsCustomer}
                  channelIds={channelIds}
                  visibility={visibility}
                  departmentIds={departmentIds}
                  integrationId={this.props.integrationId}
                  isSubmitted={this.props.isReadyToSaveForm}
                  onChange={this.onChange}
                  onChildProcessFinished={this.props.onChildProcessFinished}
                  waitUntilFinish={this.props.waitUntilFinish}
                />
              </Step>

              <Step
                img="/images/icons/erxes-05.svg"
                title="Advanced styling"
                onClick={this.onStepClick}
              >
                <StyleSheetStep css={css} onChange={this.onChange} />
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
                  successImage={successImage}
                  successPreviewStyle={successPreviewStyle}
                  successImageSize={successImageSize}
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
              image={logo}
              thankTitle={thankTitle}
              thankContent={thankContent}
              skip={isSkip}
              carousel={carousel}
              formData={formData}
              calloutImgSize={calloutImgSize}
              successImgSize={successImageSize}
              successImage={successImage}
              configs={configs}
            />
          </PreviewWrapper>
        </Content>
      </StepWrapper>
    );
  }
}

export default Lead;
