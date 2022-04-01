import React from 'react';
import { StepWrapper, SteperItem, StepCount } from './styles';
import Step from './Step';
import Steps from './Steps';

function StepperWrapper(props: {
  children: React.ReactNode}) {
  return <StepWrapper {...props} />;
}

function StepperItem(props: {
  children: React.ReactNode;
  complete?: boolean}) {
  return <SteperItem {...props} />;
}

function StepCounter(props: {
  children: React.ReactNode;
  complete?: boolean}) {
  return <StepCount {...props} />;
}

export { StepperWrapper, StepperItem, StepCounter, Step, Steps };
