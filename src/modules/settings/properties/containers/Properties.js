import React from 'react';
import { Properties } from '../components';

const PropertiesContainer = props => {
  const updatedProps = {
    ...props
  };

  return <Properties {...updatedProps} />;
};

export default PropertiesContainer;
