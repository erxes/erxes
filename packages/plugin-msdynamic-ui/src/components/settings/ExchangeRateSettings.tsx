import Button from '@erxes/ui/src/components/Button';
import { IConfigsMap } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
import { ContentBox } from '../../styles';
import SettingSideBar from './SettingSideBar';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { ControlLabel, FormControl, FormGroup } from '@erxes/ui/src/components';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const ExchangeRateSettings: React.FC<Props> = ({ save, configsMap }: Props) => {
  const [currentMap, setCurrentMap] = useState(
    configsMap.DYNAMIC_EXCHANGE_RATE || {}
  );

  const onSave = (e) => {
    e.preventDefault();
    configsMap.DYNAMIC_EXCHANGE_RATE = currentMap;

    save(configsMap);
  };

  const onChangeConfig = (code: string, value) => {
    setCurrentMap({ ...currentMap, [code]: value });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderContent = (
    <ContentBox id={'ExchangeRatesMenu'}>
      <CollapseContent
        title={__('Exchange Rates')}
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
        open={true}
      >
        <FormGroup>
          <ControlLabel>{'API URL'}</ControlLabel>
          <FormControl
            defaultValue={currentMap.apiUrl}
            onChange={onChangeInput.bind(this, 'apiUrl')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Username'}</ControlLabel>
          <FormControl
            defaultValue={currentMap.username}
            onChange={onChangeInput.bind(this, 'username')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Password'}</ControlLabel>
          <FormControl
            defaultValue={currentMap.password}
            onChange={onChangeInput.bind(this, 'password')}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="success"
            icon="check-circle"
            onClick={onSave}
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    </ContentBox>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('exchange Rates'), link: '/msdynamic-exchangeRates' },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('exchange Rates config')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Exchange Rates')}</Title>}
          background="colorWhite"
        />
      }
      leftSidebar={<SettingSideBar />}
      content={renderContent}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default ExchangeRateSettings;
