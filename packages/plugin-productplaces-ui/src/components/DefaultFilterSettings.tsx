import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button, CollapseContent, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { FormColumn, FormWrapper, ModalFooter } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const DefaultFilterSettings = (props: Props) => {
  const [configs, setConfigs] = useState<{ _id: string; title: string, segmentId: string, userIds: string[] }[]>(props.configsMap.dealsProductsDefaultFilter || []);

  const add = (e) => {
    e.preventDefault();

    // must save prev item saved then new item
    const newPlacesConfig = {
      _id: Math.random().toString(),
      title: 'New Filter Config',
      segmentId: '',
      userIds: [],
    };

    setConfigs((prevConfigsMap) => ([
      ...prevConfigsMap,
      newPlacesConfig,
    ]));
  };

  const deleteHandler = (_id: string) => {
    setConfigs([...configs.filter(c => c._id !== _id)]);
  };

  const saveHandler = (_id, config) => {
    setConfigs([...configs.map(c => c._id === _id ? config : c)]);
  }

  const renderConfigs = (configs) => {
    return configs.map((config) => {
      return (
        <CollapseContent
          title={__(config.title)}
          open={true}
        >
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{"Title"}</ControlLabel>
                <FormControl
                  defaultValue={config["title"]}
                  onChange={e => saveHandler(config._id, { ...config, title: (e.target as any).value })}
                  required={true}
                  autoFocus={true}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Segment</ControlLabel>
                <SelectSegments
                  name="segmentId"
                  label={__("Choose segments")}
                  contentTypes={["core:product"]}
                  initialValue={config.segmentId}
                  multi={false}
                  onSelect={segmentId => saveHandler(config._id, { ...config, segmentId })}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <SelectTeamMembers
            multi={true}
            initialValue={config.userIds || []}
            label='Assigned Users'
            name='userIds'
            onSelect={(userIds) => saveHandler(config._id, { ...config, userIds })}
          />

          <ModalFooter>
            <Button
              btnStyle="simple"
              icon="cancel-1"
              onClick={deleteHandler.bind(this, config._id)}
              uppercase={false}
            >
              Delete
            </Button>
          </ModalFooter>
        </CollapseContent>
      );
    });
  };

  const renderContent = () => {
    return (
      <ContentBox id={'DefaultFilterSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Default filter config') },
  ];

  const actionButtons = (
    <>
      <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
        New config
      </Button>
      <Button
        btnStyle="primary"
        icon="check-circle"
        onClick={() => props.save({ ...props.configsMap, dealsProductsDefaultFilter: configs })}
      >
        Save
      </Button>
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Default filter config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Default filter configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      hasBorder={true}
      transparent={true}
    />
  );
};

export default DefaultFilterSettings;
