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
import { IBookingDocument, IBooking, IStyle } from '../types';
import { Steps, Step } from 'modules/common/components/step';
import ChooseStyle from './steps/ChooseStyle';
import ChooseContent from './steps/ChooseContent';
import ChooseSettings from './steps/ChooseSettings';
import FullPreview from './steps/FullPreview';

import { PreviewWrapper } from './steps/style';
import { colors } from 'modules/common/styles';

type Props = {
  bookingDetail?: IBookingDocument;
  queryParams?: any;
  history: any;
  bookingId?: any;
  save: (doc, styles) => void;
  isActionLoading?: boolean;
};

type State = {
  name: string;
  description: string;
  userFilters: string[];

  productCategoryId: string;

  // settings
  title: string;
  brandId: string;
  channelIds: string[];
  languageCode: string;
  formId: string;
  buttonText: string;
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

function Booking({ save, isActionLoading, bookingDetail }: Props) {
  const booking = bookingDetail || ({} as IBooking);

  const [state, setState] = useState<State>({
    // content
    name: booking.name || '',
    description: booking.description || '',
    userFilters: booking.userFilters || [],

    productCategoryId: booking.productCategoryId || '',

    // settings
    title: booking.title || '',
    brandId: booking.brandId || '',
    channelIds: booking.channelIds || [],
    languageCode: booking.languageCode || '',
    formId: booking.formId || '',
    buttonText: booking.buttonText || ''
  });

  const bookingStyles = booking.styles || ({} as IStyle);

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

    save(state, styles);
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
              />
            </Step>

            <Step
              img="/images/icons/erxes-01.svg"
              title="Settings"
              noButton={true}
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseSettings
                onChange={onChange}
                title={state.title}
                brandId={state.brandId}
                channelIds={state.channelIds}
                languageCode={state.languageCode}
                formId={state.formId}
                buttonText={state.buttonText}
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
