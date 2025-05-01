import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';

import { ContentBox } from '../styles';
import { IConfig } from '../types';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  saveConfig: (params: IConfig) => void;
  config: IConfig;
};

const GeneralSettings = (props: Props) => {
  const { config, saveConfig } = props;

  const [apiUrl, setApiUrl] = useState<string>(config.apiUrl || '');
  const [baseDN, setBaseDN] = useState<string>(config.baseDN || '');
  const [adminDN, setAdminDN] = useState<string>(config.adminDN || '');
  const [adminPassword, setAdminPassword] = useState<string>(
    config.adminPassword || ''
  );

  const save = (e) => {
    e.preventDefault();

    saveConfig({
      apiUrl,
      baseDN,
      code: 'ACTIVEDIRECTOR',
      adminDN,
      adminPassword,
    });
  };

  const onChangeInput = (e) => {
    setApiUrl(e.target.value);
  };

  const onChangeBaseDN = (e) => {
    setBaseDN(e.target.value);
  };

  const onChangeAdminDN = (e) => {
    setAdminDN(e.target.value);
  };

  const onChangePass = (e) => {
    setAdminPassword(e.target.value);
  };

  const renderContent = () => {
    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          title="General settings"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          <FormGroup>
            <ControlLabel>{'api url'}</ControlLabel>
            <FormControl value={apiUrl} onChange={onChangeInput} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{'base dn'}</ControlLabel>
            <FormControl value={baseDN} onChange={onChangeBaseDN} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{'admin dn'}</ControlLabel>
            <FormControl value={adminDN} onChange={onChangeAdminDN} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{'admin pass'}</ControlLabel>
            <FormControl
              type="password"
              value={adminPassword}
              onChange={onChangePass}
            />
          </FormGroup>
        </CollapseContent>
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Active director config') },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={save}
      icon="check-circle"
      uppercase={false}
    >
      Save
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Active director config')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Active director configs')}</Title>}
          right={actionButtons}
          background="colorWhite"
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default GeneralSettings;
