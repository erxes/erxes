export const submenu = [
  { title: 'Buildings', link: '/mobinet/building/list' },
  { title: 'Quarters', link: '/mobinet/quarter/list' },
  { title: 'Districts', link: '/mobinet/district/list' },
  { title: 'Cities', link: '/mobinet/city/list' }
];

export const getGqlString = doc => {
  return doc.loc && doc.loc.source.body;
};
