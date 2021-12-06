import React from 'react';
import Settings from 'modules/automations/components/forms/settings/Settings';

type Props = {};

const SettingsContainer = (props: Props) => {
  const extendedProps = {
    ...props,
    hours: []
  };

  return <Settings {...extendedProps} />;
};

export default SettingsContainer;
