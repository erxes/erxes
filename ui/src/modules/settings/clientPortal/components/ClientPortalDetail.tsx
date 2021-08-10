import CollapseContent from 'modules/common/components/CollapseContent';
import React from 'react';
import { CONFIG_TYPES } from '../constants';
import { ClientPortalConfig } from '../types';
import Form from './Form';

type Props = {
  config: ClientPortalConfig;
  handleUpdate: (doc: ClientPortalConfig) => void;
};

function ClientPortal({ config, handleUpdate }: Props) {
  const commonProps = {
    defaultConfigValues: config,
    handleUpdate
  };

  return (
    <div id="ClientPortalSettings">
      <CollapseContent title={CONFIG_TYPES.GENERAL.LABEL} open={true}>
        <Form {...commonProps} configType={CONFIG_TYPES.GENERAL.VALUE} />
      </CollapseContent>
      <CollapseContent title={CONFIG_TYPES.ADVANCED.LABEL}>
        <Form {...commonProps} configType={CONFIG_TYPES.ADVANCED.VALUE} />
      </CollapseContent>
      <CollapseContent title={CONFIG_TYPES.COLOR_FONTS.LABEL}>
        <Form {...commonProps} configType={CONFIG_TYPES.COLOR_FONTS.VALUE} />
      </CollapseContent>
      <CollapseContent title={CONFIG_TYPES.STYLE_SHEET.LABEL}>
        <Form {...commonProps} configType={CONFIG_TYPES.STYLE_SHEET.VALUE} />
      </CollapseContent>
      <CollapseContent title={CONFIG_TYPES.CONFIG.LABEL}>
        <Form {...commonProps} configType={CONFIG_TYPES.CONFIG.VALUE} />
      </CollapseContent>
    </div>
  );
}

export default ClientPortal;
