import React from 'react';
import { StepWrapper, StepItem, StepCount } from './styles';

function StepperWrapper(props: {
  children: React.ReactNode}) {
  return <StepWrapper {...props} />;
}

function StepperItem(props: {
  children: React.ReactNode}) {
  return <StepItem {...props} />;
}

function StepCounter(props: {
  children: React.ReactNode;
  complete?: boolean}) {
  return <StepCount {...props} />;
}

export { StepperWrapper, StepperItem, StepCounter };