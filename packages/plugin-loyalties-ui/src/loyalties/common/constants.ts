import { isEnabled } from '@erxes/ui/src/utils/core';

export const menuLoyalties = [
  { title: 'Vouchers', link: '/vouchers' },
  { title: 'Lotteries', link: '/lotteries' },
  { title: 'Spins', link: '/spins' },
  { title: 'Donates', link: '/donates' },
  { title: 'Score', link: '/score' },
  { title: 'Assignments', link: '/assignments' }
];

export const getOwnerTypes = () => {
  const ownerTypes = [
    {
      label: 'Customer',
      value: 'customer'
    },
    {
      label: 'Company',
      value: 'company'
    },
    {
      label: 'Team Members',
      value: 'user'
    }
  ];

  if (isEnabled('clientportal')) {
    ownerTypes.push({
      label: 'Client Portal User',
      value: 'cpUser'
    });
  }

  return ownerTypes;
};
