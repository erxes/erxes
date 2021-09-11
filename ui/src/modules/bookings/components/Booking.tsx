import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'modules/common/components/step/styles';
import Button from 'modules/common/components/Button';
import { Link } from 'react-router-dom';
// import { SmallLoader } from 'modules/common/components/ButtonMutate';
import { Content, LeftContent } from 'modules/settings/integrations/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import { IBookingDocument } from '../types';
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
};

function Booking(props: Props) {
  const [state, setState] = useState({
    name: '',
    image: [],
    description: '',
    userFilters: [],

    propertyCategoryId: ''
  });

  const breadcrumb = [{ title: __('Bookings'), link: '/bookings' }];

  const handleSubmit = () => {
    console.log(state);
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
          {/* {<SmallLoader />} */}
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
              <ChooseContent onChange={onChange} />
            </Step>

            <Step
              img="/images/icons/erxes-01.svg"
              title="Settings"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseSettings onChange={onChange} />
            </Step>
          </Steps>
          <ControlWrapper>
            <Indicator>
              {__('You are')} {'creating'} <strong>{'title'}</strong>{' '}
              {__('form')}
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
