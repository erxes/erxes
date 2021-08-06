import React from 'react';
import Plugincomponent from '../ui/components/companybranding'
const CompanyBrandingForm = () => {
  return (
    <Plugincomponent />
  );
};

export default () => ({
  routes: [
    {
      path: '/list',
      component: CompanyBrandingForm
    }
  ],
  menu: {
    label: 'Plugin Company Branding',
    icon: 'icon-car',
    link: '/list',
    permission: 'showCars'
  }
});