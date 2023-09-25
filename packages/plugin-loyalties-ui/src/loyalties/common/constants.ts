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
      name: 'customer'
    },
    {
      label: 'Company',
      name: 'company'
    },
    {
      label: 'Team Members',
      name: 'user'
    }
  ];

  if (isEnabled('clientportal')) {
    ownerTypes.push({
      label: 'Client Portal User',
      name: 'cpUser'
    });
  }

  return ownerTypes;
};
