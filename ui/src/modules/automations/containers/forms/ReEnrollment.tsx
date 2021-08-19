import React from 'react';
import ReEnrollment from 'modules/automations/components/forms/ReEnrollment';

type Props = {};

const ReEnrollmentContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <ReEnrollment {...extendedProps} />;
};

export default ReEnrollmentContainer;
