import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'modules/common/components/step/styles';
import Button from 'modules/common/components/Button';
import { Link } from 'react-router-dom';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import { Content, LeftContent } from 'modules/settings/integrations/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import { Alert, __ } from 'modules/common/utils';
import React, { useState } from 'react';
import {
  IStyle,
  IDisplayBlock,
  IBookingIntegration,
  IBookingData
} from '../types';

import { Steps, Step } from 'modules/common/components/step';
import ChooseStyle from './steps/ChooseStyle';
import ChooseContent from './steps/ChooseContent';
import ChooseSettings from './steps/ChooseSettings';
import FormStep from './steps/FormStep';
import SuccessStep from 'modules/leads/components/step/SuccessStep';

import FullPreview from './steps/FullPreview';
import { IField } from 'modules/settings/properties/types';

import { PreviewWrapper } from './steps/style';
import { colors } from 'modules/common/styles';
import { IForm, IFormData } from 'modules/forms/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import { ILeadData } from 'modules/leads/types';

type Props = {
  integration?: IBookingIntegration;
  queryParams?: any;
  history: any;
  save: (doc: any) => void;
  isActionLoading?: boolean;
  afterFormDbSave: (formId: string) => void;
  isReadyToSaveForm: boolean;
  emailTemplates?: IEmailTemplate[];
};

type State = {
  name: string;
  description: string;
  userFilters: string[];
  image: any;

  productCategoryId: string;

  // settings
  title: string;
  brandId: string;
  channelIds: string[];
  languageCode: string;
  formId: string;
  formData: IFormData;
};

type Style = {
  itemShape: string;
  widgetColor: string;

  productAvailable: string;
  productUnavailable: string;
  productSelected: string;

  textAvailable: string;
  textUnavailable: string;
  textSelected: string;
};

type DisplayBlock = {
  shape: string;
  columns: number;
  rows: number;
  margin: number;
};

function Booking(props: Props) {
  const {
    save,
    isActionLoading,
    afterFormDbSave,
    isReadyToSaveForm,
    emailTemplates
  } = props;

  const integration = props.integration || ({} as IBookingIntegration);
  const booking = integration.bookingData || ({} as IBookingData);
  const form = integration.form || ({} as IForm);
  const channels = integration.channels || [];

  const [state, setState] = useState<State>({
    // content
    name: booking.name || '',
    description: booking.description || '',
    image: booking.image,

    userFilters: booking.userFilters || [],

    productCategoryId: booking.productCategoryId || '',

    // settings
    title: integration.name || '',
    brandId: integration.brandId || '',
    channelIds: channels.map(item => item._id) || [],
    languageCode: integration.languageCode || '',
    formId: integration.formId || '',

    formData: {
      title: form.title || 'Form Title',
      description: form.description || 'Form Description',
      buttonText: form.buttonText || 'Send',
      fields: [],
      type: form.type || '',
      numberOfPages: form.numberOfPages || 1
    }
  });

  const bookingStyles = booking.style || ({} as IStyle);

  const [styles, setStyles] = useState<Style>({
    itemShape: bookingStyles.itemShape || '',
    widgetColor: bookingStyles.widgetColor || colors.colorPrimary,

    productAvailable: bookingStyles.productAvailable || colors.colorPrimary,
    productUnavailable:
      bookingStyles.productUnavailable || colors.colorCoreGray,
    productSelected: bookingStyles.productSelected || colors.colorCoreOrange,

    textAvailable: bookingStyles.textAvailable || colors.colorPrimary,
    textUnavailable: bookingStyles.textUnavailable || colors.colorLightGray,
    textSelected: bookingStyles.textSelected || colors.colorCoreYellow
  });

  const displayBlock = booking.displayBlock || ({} as IDisplayBlock);

  const [block, setBlock] = useState<DisplayBlock>({
    shape: displayBlock.shape || '',
    columns: displayBlock.columns || 0,
    rows: displayBlock.rows || 0,
    margin: displayBlock.margin || 0
  });

  const leadData = integration.leadData || ({} as ILeadData);

  const [successData, setSuccessData] = useState({
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
    themeColor: styles.widgetColor || '',

    isRequireOnce: leadData.isRequireOnce
  });

  const breadcrumb = [{ title: __('Bookings'), link: '/bookings' }];

  const handleSubmit = () => {
    if (!state.name) {
      return Alert.error('Enter a Booking name');
    }

    if (!state.brandId) {
      return Alert.error('Choose a brand');
    }

    if (!state.languageCode) {
      return Alert.error('Choose a language');
    }

    if (!state.title) {
      return Alert.error('Enter a title');
    }

    if (!state.productCategoryId) {
      return Alert.error('Choose main product category');
    }

    const doc = {
      name: state.name,
      brandId: state.brandId,
      channelIds: state.channelIds,
      languageCode: state.languageCode,

      leadData: {
        ...successData,
        loadType: 'popup'
      },
      bookingData: {
        name: state.title,
        description: state.description,
        image: state.image,
        productCategoryId: state.productCategoryId,

        style: {
          ...styles
        }

        // displayBlock: {
        //   ...block
        // },
      }
    };

    save(doc);
  };

  const onChange = (key: string, value: any) => {
    setState({
      ...state,
      [key]: value
    });
  };

  const onChangeStyle = (key: string, value: any) => {
    setStyles({
      ...styles,
      [key]: value
    });
  };

  const onChangeBlock = (key: string, value: any) => {
    setBlock({
      ...block,
      [key]: value
    });
  };

  const onChangeSuccess = (key: string, value: any) => {
    setSuccessData({
      ...successData,
      [key]: value
    });
  };

  const onFormDocChange = formData => {
    setState({ ...state, formData });
  };

  const onFormInit = (fields: IField[]) => {
    const formData = state.formData;
    formData.fields = fields;

    setState({ ...state, formData });
  };

  const renderButtons = () => {
    const cancelButton = (
      <Link to="/bookings">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          disabled={false}
          btnStyle="success"
          icon={'check-circle'}
          onClick={handleSubmit}
        >
          {isActionLoading ? <SmallLoader /> : null}
          Save
        </Button>
      </Button.Group>
    );
  };
  return (
    <StepWrapper>
      <Wrapper.Header title={__('Booking')} breadcrumb={breadcrumb} />
      <Content>
        <LeftContent>
          <Steps>
            <Step
              img="/images/icons/erxes-04.svg"
              title="Style"
              // onClick={this.onStepClick.bind(null, 'appearance')}
            >
              <ChooseStyle
                onChangeStyle={onChangeStyle}
                itemShape={styles.itemShape}
                widgetColor={styles.widgetColor}
                productAvailable={styles.productAvailable}
                productUnavailable={styles.productUnavailable}
                productSelected={styles.productSelected}
                textAvailable={styles.textAvailable}
                textUnavailable={styles.textUnavailable}
                textSelected={styles.textSelected}
              />
            </Step>

            <Step
              img="/images/icons/erxes-09.svg"
              title="Content"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseContent
                onChange={onChange}
                name={state.name}
                description={state.description}
                productCategoryId={state.productCategoryId}
                userFilters={state.userFilters}
                image={state.image}
                onChangeBlock={onChangeBlock}
                displayBlock={block}
              />
            </Step>

            <Step
              img="/images/icons/erxes-01.svg"
              title="Settings"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseSettings
                onChange={onChange}
                title={state.title}
                brandId={state.brandId}
                channelIds={state.channelIds}
                languageCode={state.languageCode}
              />
            </Step>

            <Step
              img="/images/icons/erxes-02.svg"
              title="Form"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <FormStep
                theme={(booking.style && booking.style.widgetColor) || ''}
                afterDbSave={afterFormDbSave}
                formData={state.formData}
                isReadyToSaveForm={isReadyToSaveForm}
                formId={integration.formId}
                onDocChange={onFormDocChange}
                onInit={onFormInit}
              />
            </Step>

            <Step
              img="/images/icons/erxes-02.svg"
              title="Form"
              noButton={true}
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <SuccessStep
                onChange={onChangeSuccess}
                thankTitle={successData.thankTitle}
                thankContent={successData.thankContent}
                type={'popup'}
                color={''}
                theme={(booking.style && booking.style.widgetColor) || ''}
                successAction={successData.successAction}
                leadData={leadData}
                formId={integration.formId}
                emailTemplates={emailTemplates ? emailTemplates : []}
              />
            </Step>
          </Steps>
          <ControlWrapper>
            <Indicator>
              {__('You are')} {booking ? 'editing' : 'creating'}{' '}
              <strong>{state.name}</strong> {__('form')}
            </Indicator>
            {renderButtons()}
          </ControlWrapper>
        </LeftContent>

        <PreviewWrapper>
          <FullPreview />
        </PreviewWrapper>
      </Content>
    </StepWrapper>
  );
}

export default Booking;
