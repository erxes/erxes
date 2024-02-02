import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';
import { KEY_LABELS } from '../constants';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings: React.FC<Props> = ({ save, configsMap }: Props) => {
  const [currentMap, setCurrentMap] = useState(configsMap.EBARIMT || {});

  const saveHandler = (e) => {
    e.preventDefault();

    configsMap.EBARIMT = currentMap;
    save(configsMap);
  };

  const onChangeConfig = (code: string, value) => {
    currentMap[code] = value;

    setCurrentMap(currentMap);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderItem = (key: string, description?: string) => {
    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={currentMap[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Ebarimt config') },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={saveHandler}
      icon="check-circle"
      uppercase={false}
    >
      Save
    </Button>
  );

  const content = (
    <ContentBox id={'GeneralSettingsMenu'}>
      <CollapseContent
        title="Ebarimt settings"
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
      >
        {renderItem('companyName')}
        {renderItem('ebarimtUrl')}
        {renderItem('checkCompanyUrl')}
      </CollapseContent>
    </ContentBox>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Ebarimt config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          background="colorWhite"
          left={<Title>{__('Ebarimt configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={content}
      hasBorder={true}
      transparent={true}
    />
  );
};

export default GeneralSettings;
