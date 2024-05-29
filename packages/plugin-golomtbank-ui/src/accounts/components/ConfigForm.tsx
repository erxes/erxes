import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';

import React, { useState } from "react";
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../../types/IConfigs';
import Sidebar from './SideBar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

function GolomtConfig (props: Props) {
 
  const add = (e) => {
    e.preventDefault();

    const { configsMap } = props;
   // configsMap.GOLOMTBANK = configsMap;
    props.save(configsMap);
  }

  const onChangeConfig = (code: string, value) => {
    let {configsMap} = props;
    useState({ configsMap:{...configsMap,[code]:value} });
  };

 const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

 const renderItem = (key: string, description?: string) => {
    const { configsMap } = props;
    return (
      <FormGroup>
        <ControlLabel>{key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          value={configsMap[key]}
          onChange={onChangeInput.bind(renderItem, key)}
        />
      </FormGroup>
    );
  };


  const renderContent = () => {
    return (
      <ContentBox id={'MainConfigMenu'}>
        <CollapseContent
          title="Main Config"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          {renderItem('sessionKey')}
          {renderItem('ivKey')}
          {renderItem('password')}
          {renderItem('clientId')}
        </CollapseContent>
      </ContentBox>
    );
  };
  const breadcrumb = [
    { title: __('Config'), link: '/settings' },
    { title: __('GOLOMT BANK CONFIG') },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={add}
      icon="check-circle"
      uppercase={false}
    >
      Save
    </Button>
  )
 
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Golomt bank config')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Golomt bank config')}</Title>}
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
}

export default GolomtConfig;