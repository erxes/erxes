import StageSettings from './containers/StageSettings';
import GeneralSettings from './containers/GeneralSettings';
import React from 'react';
import Response from './containers/Response';

const returnResponse = ({ currentUser }) => {
  return (
    <Response currentUser={currentUser}></Response>
  )
}

export default () => ({
  routes: [
    {
      path: '/settings/stage',
      component: StageSettings
    },
    {
      path: '/settings/general',
      component: GeneralSettings
    }
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
