import * as React from 'react';
import { GettingStart } from '../components';
import { OnboardConsumer, OnboardProvider } from './OnboardContext';

const container = () => (
  <OnboardProvider>
    <OnboardConsumer>
      {({ activeStep, goStep }) => (
        <GettingStart activeStep={activeStep} goStep={goStep} />
      )}
    </OnboardConsumer>
  </OnboardProvider>
);

export default container;
