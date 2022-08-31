import { Alert, __ } from 'coreui/utils';
import { Content, LeftContent } from '../../settings/integrations/styles';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import { IBooking, IBookingIntegration } from '../types';
import { IBookingData, IStyle } from '../../settings/integrations/types';
import { IForm, IFormData } from '@erxes/ui-forms/src/forms/types';
import React, { useState } from 'react';
import { Step, Steps } from '@erxes/ui/src/components/step';

import Button from '@erxes/ui/src/components/Button';
import ContentStep from './steps/ContentStep';
import FormStep from './steps/FormStep';
import FullPreview from '@erxes/ui/src/components/step/FullPreview';
import { IAttachment } from '@erxes/ui/src/types';
import { IConfig } from '@erxes/ui-settings/src/general/types';
import { IField } from '@erxes/ui/src/types';
import { ILeadData } from '@erxes/ui-leads/src/types';
import { Link } from 'react-router-dom';
import { PreviewWrapper } from '@erxes/ui/src/components/step/style';
import SettingsStep from './steps/SettingsStep';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import StyleStep from './steps/StyleStep';
import SuccessStep from '@erxes/ui-leads/src/components/step/SuccessStep';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { colors } from '@erxes/ui/src/styles';

type Props = {
  integration?: IBookingIntegration;
  queryParams?: any;
  history: any;
  configs: IConfig[];
  save: (params: {
    name: string;
    brandId: string;
    languageCode?: string;
    leadData: ILeadData;
    channelIds?: string[];
    bookingData: IBookingData;
  }) => void;
  isActionLoading?: boolean;
  afterFormDbSave: (formId: string) => void;
  isReadyToSaveForm: boolean;
  emailTemplates?: any[] /*change type*/;
  productFields: IField[];
};

type State = {
  title: string;
  brandId: string;
  channelIds: string[];
  languageCode: string;
  formId: string;
  formData: IFormData;
  carousel: string;

  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  attachments?: IAttachment[];
  redirectUrl?: string;
  loadType: string;
  successImage?: string;
  successImageSize?: string;
};

function Booking(props: Props) {
  const {
    save,
    isActionLoading,
    afterFormDbSave,
    isReadyToSaveForm,
    emailTemplates,
    productFields,
    configs
  } = props;

  const integration = props.integration || ({} as IBookingIntegration);
  const bookingData = integration.bookingData || ({} as IBookingData);
  const form = integration.form || ({} as IForm);
  const channels = integration.channels || [];
  const bookingStyle = bookingData.style || ({} as IStyle);
  const leadData = integration.leadData || ({} as ILeadData);

  const [state, setState] = useState<State>({
    title: integration.name || '',
    brandId: integration.brandId || '',
    channelIds: channels.map(item => item._id) || [],
    languageCode: integration.languageCode || 'en',
    formId: integration.formId || '',

    formData: {
      title: form.title || 'Form Title',
      description: form.description || '',
      buttonText: form.buttonText || 'Send',
      fields: [],
      type: form.type || '',
      numberOfPages: form.numberOfPages || 1
    },

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
    successImage: leadData.successImage || '',
    successImageSize: leadData.successImageSize || '',
    loadType: 'popup',

    carousel: 'form'
  });

  const [booking, setBooking] = useState<IBooking>({
    name: bookingData.name || '',
    description: bookingData.description || '',
    image: bookingData.image,
    userFilters: bookingData.userFilters || [],
    productCategoryId: bookingData.productCategoryId || '',
    navigationText: bookingData.navigationText || '',
    bookingFormText: bookingData.bookingFormText || 'Book product',
    itemShape: bookingStyle.itemShape || '',
    widgetColor: bookingStyle.widgetColor || colors.colorPrimary,
    productAvailable: bookingStyle.productAvailable || colors.colorPrimary,
    line: bookingStyle.line || '',
    columns: bookingStyle.columns || 2,
    rows: bookingStyle.rows || 1,
    margin: bookingStyle.margin || 15,
    baseFont: bookingStyle.baseFont || '',

    productFieldIds: bookingData.productFieldIds || []
  });

  const breadcrumb = [{ title: __('Bookings'), link: '/bookings' }];

  const handleSubmit = () => {
    if (!booking.name) {
      return Alert.error('Enter a booking name');
    }

    if (!booking.description) {
      return Alert.error('Enter a booking description');
    }

    if (!state.brandId) {
      return Alert.error('Choose a brand');
    }

    if (!state.title) {
      return Alert.error('Enter a title');
    }

    if (!booking.productCategoryId) {
      return Alert.error('Choose main product category');
    }

    const doc = {
      name: state.title,
      brandId: state.brandId,
      channelIds: state.channelIds,
      languageCode: state.languageCode,

      leadData: {
        themeColor: booking.widgetColor,
        successAction: state.successAction,
        fromEmail: state.fromEmail,
        userEmailTitle: state.userEmailTitle,
        userEmailContent: state.userEmailContent,
        adminEmails: state.adminEmails,
        adminEmailTitle: state.adminEmailTitle,
        adminEmailContent: state.adminEmailContent,
        thankTitle: state.thankTitle,
        thankContent: state.thankContent,
        attachments: state.attachments,
        redirectUrl: state.redirectUrl,
        loadType: 'popup',
        successImage: state.successImage,
        successImageSize: state.successImageSize
      },

      bookingData: {
        name: booking.name,
        description: booking.description,
        image: booking.image,
        productCategoryId: booking.productCategoryId,
        navigationText: booking.navigationText,
        bookingFormText: booking.bookingFormText,
        productFieldIds: booking.productFieldIds,

        style: {
          itemShape: booking.itemShape,
          widgetColor: booking.widgetColor,
          productAvailable: booking.productAvailable,
          line: booking.line,
          rows: Number(booking.rows),
          columns: Number(booking.columns),
          margin: Number(booking.margin),
          baseFont: booking.baseFont
        }
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

  const onChangeBooking = (key: string, value: any) => {
    setBooking({
      ...booking,
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

  const onStepClick = currentStepNumber => {
    let carousel = 'form';
    switch (currentStepNumber) {
      case 4:
        carousel = 'form';
        break;
      case 5:
        carousel = 'success';
        break;
    }
    return setState({ ...state, carousel });
  };

  return (
    <StepWrapper>
      <Wrapper.Header title={__('Booking')} breadcrumb={breadcrumb} />
      <Content>
        <LeftContent>
          <Steps>
            <Step img="/images/icons/erxes-04.svg" title="Style">
              <StyleStep
                onChangeBooking={onChangeBooking}
                itemShape={booking.itemShape}
                widgetColor={booking.widgetColor}
                productAvailable={booking.productAvailable}
                baseFont={booking.baseFont}
              />
            </Step>

            <Step img="/images/icons/erxes-09.svg" title="Content">
              <ContentStep
                onChangeBooking={onChangeBooking}
                name={booking.name}
                description={booking.description}
                productCategoryId={booking.productCategoryId}
                userFilters={booking.userFilters}
                image={booking.image}
                line={booking.line}
                columns={booking.columns}
                rows={booking.rows}
                margin={booking.margin}
                navigationText={booking.navigationText}
                bookingFormText={booking.bookingFormText}
                productFieldIds={booking.productFieldIds}
                productFields={productFields}
              />
            </Step>

            <Step img="/images/icons/erxes-01.svg" title="Settings">
              <SettingsStep
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
              onClick={onStepClick}
            >
              <FormStep
                theme={booking.widgetColor || ''}
                afterDbSave={afterFormDbSave}
                formData={state.formData}
                isReadyToSaveForm={isReadyToSaveForm}
                formId={integration.formId}
                onDocChange={onFormDocChange}
                onInit={onFormInit}
              />
            </Step>

            <Step
              img="/images/icons/erxes-13.svg"
              title="Confirmation"
              onClick={onStepClick}
              noButton={true}
            >
              <SuccessStep
                onChange={onChange}
                thankTitle={state.thankTitle}
                thankContent={state.thankContent}
                type={state.loadType}
                color={booking.widgetColor}
                theme={booking.widgetColor || ''}
                successAction={state.successAction}
                leadData={leadData}
                formId={integration.formId}
                emailTemplates={emailTemplates ? emailTemplates : []}
                successImage={state.successImage}
                successImageSize={state.successImageSize}
              />
            </Step>
          </Steps>
          <ControlWrapper>
            <Indicator>
              {__('You are')} {booking ? 'editing' : 'creating'}{' '}
              <strong>{booking.name}</strong> {__('form')}
            </Indicator>
            {renderButtons()}
          </ControlWrapper>
        </LeftContent>

        <PreviewWrapper>
          <FullPreview
            onChange={onChange}
            onDocChange={onFormDocChange}
            type={state.loadType}
            color={booking.widgetColor}
            theme={booking.widgetColor}
            thankTitle={state.thankTitle}
            thankContent={state.thankContent}
            skip={true}
            carousel={state.carousel}
            formData={state.formData}
            configs={configs}
            successImage={state.successImage}
            successImgSize={state.successImageSize}
          />
        </PreviewWrapper>
      </Content>
    </StepWrapper>
  );
}

export default Booking;
