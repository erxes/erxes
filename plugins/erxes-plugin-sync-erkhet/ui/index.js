import Settings from './containers/Settings';
import GeneralSettings from './components/GeneralSettings'
import StageSettings from './components/StageSettings'
import PipelineSettings from './components/PipelineSettings'
import React from 'react';
import Response from './containers/Response';

const returnResponse = ({ currentUser }) => {
  return (
    <Response currentUser={currentUser}></Response>
  )
}

const GeneralSetting = () => {
  return (
    <Settings
      component={GeneralSettings}
    ></Settings>
  )
}

const StageSetting = () => {
  return (
    <Settings
      component={StageSettings}
    ></Settings>
  )
}

const PipelineSetting = () => {
  return (
    <Settings
      component={PipelineSettings}
    ></Settings>
  )
}

export default () => ({
  routes: [
    {
      path: '/settings/general',
      component: GeneralSetting
    },
    {
      path: '/settings/stage',
      component: StageSetting
    },
    {
      path: '/settings/pipeline',
      component: PipelineSetting
    },
  ],
  settings: [
    {
      name: 'Sync Erkhet',
      image: '/images/icons/erxes-04.svg',
      to: '/erxes-plugin-sync-erkhet/settings/general',
      action: 'syncErkhetConfig',
      permissions: [],
    }
  ],
  response: returnResponse
});
