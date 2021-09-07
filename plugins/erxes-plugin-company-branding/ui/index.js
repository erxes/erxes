import React from 'react';

import Plugincomponent from './containers/companyBranding'
const CompanyBrandingForm = () => {
  return (
    <Plugincomponent />
  );
};

export default () => ({
  preAuth: ({ API_URL }) => {
    return fetch(`${API_URL}/get-branding`).then(response => response.json())
  },
  routes: [
    {
      path: '/settings',
      component: CompanyBrandingForm
    }
  ],
  settings: [
    {
      name: 'Company Branding',
      image: '/images/icons/erxes-35.png',
      to: '/erxes-plugin-company-branding/settings/',
      permissions: [],
    }
  ]
});