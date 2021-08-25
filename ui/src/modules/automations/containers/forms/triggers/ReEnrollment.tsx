import React from 'react';
import ReEnrollment from 'modules/automations/components/forms/triggers/ReEnrollment';
import { ITrigger } from 'modules/automations/types';

type Props = {
  trigger: ITrigger;
};

const ReEnrollmentContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <ReEnrollment {...extendedProps} />;
};

export default ReEnrollmentContainer;
