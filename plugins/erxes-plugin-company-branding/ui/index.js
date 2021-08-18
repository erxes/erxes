import React from 'react';

import Plugincomponent from './containers/companyBranding'
const CompanyBrandingForm = () => {
  return (
    <Plugincomponent />
  );
};

export default () => ({

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
      // action: 'companyBrandingConfig',
      permissions: [],
    }
  ]
});