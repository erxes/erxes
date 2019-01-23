import * as React from 'react';
import { GettingStart } from '../components';
import { AppConsumer, AppProvider } from './OnboardContext';

const container = () => (
  <AppProvider>
    <AppConsumer>
      {({ activeStep, goStep }) => (
        <GettingStart activeStep={activeStep} goStep={goStep} />
      )}
    </AppConsumer>
  </AppProvider>
);

export default container;
