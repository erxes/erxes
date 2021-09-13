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
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import { IBookingDocument, IBooking } from '../types';
import { Steps, Step } from 'modules/common/components/step';
import {
  // ChooseStyle,
  ChooseContent,
  ChooseSettings,
  FullPreview
} from './steps';
import { PreviewWrapper } from './steps/style';

type Props = {
  bookingDetail?: IBookingDocument;
  queryParams?: any;
  history: any;
  bookingId?: any;
  save: (doc: IBooking) => void;
  isActionLoading?: boolean;
};

function Booking({ save, isActionLoading, bookingDetail }: Props) {
  const booking = bookingDetail || ({} as IBooking);

  const [state, setState] = useState({
    // content
    name: booking.name || '',
    // image: booking.image || [],
    description: booking.description || '',
    userFilters: booking.userFilters || [],

    productCategoryId: booking.productCategoryId || '',

    // settings
    title: booking.title || '',
    brandId: booking.brandId || '',
    channelIds: booking.channelIds || [],
    languageCode: booking.languageCode || '',
    productStatus: booking.productStatus || '',
    formId: booking.formId || '',
    buttonText: booking.buttonText || ''
  });

  const breadcrumb = [{ title: __('Bookings'), link: '/bookings' }];

  const handleSubmit = () => {
    save(state);
  };

  const onChange = (key: string, value: any) => {
    setState({
      ...state,
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
            {/* <Step
              img="/images/icons/erxes-04.svg"
              title="Style"
              // onClick={this.onStepClick.bind(null, 'appearance')}
            >
              <ChooseStyle />
            </Step> */}

            <Step
              img="/images/icons/erxes-09.svg"
              title="Content"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseContent
                onChange={onChange}
                name={state.name}
                description={state.description}
                image={[]}
                productCategoryId={state.productCategoryId}
                userFilters={state.userFilters}
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
                productStatus={state.productStatus}
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
