import { StepWrapper } from 'modules/common/components/step/styles';
import { Content, LeftContent } from 'modules/settings/integrations/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IBookingDocument } from '../../types';
import { Steps, Step } from 'modules/common/components/step';
import { ChooseStyle, ChooseContent } from './steps';
import ChooseSettings from './steps/ChooseSettings';
import { FullPreview } from 'modules/leads/components/step/style';

type Props = {
  queryParams: any;
  bookingDetail: IBookingDocument;
};

function Form(props: Props) {
  const breadcrumb = [{ title: __('Bookings'), link: '/bookings' }];

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
              <ChooseStyle />
            </Step>

            <Step
              img="/images/icons/erxes-09.svg"
              title="Content"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseContent />
            </Step>

            <Step
              img="/images/icons/erxes-01.svg"
              title="Settings"
              // onClick={this.onStepClick.bind(null, 'greeting')}
            >
              <ChooseSettings />
            </Step>
          </Steps>
        </LeftContent>

        <FullPreview />
      </Content>
    </StepWrapper>
  );
}

export default Form;
