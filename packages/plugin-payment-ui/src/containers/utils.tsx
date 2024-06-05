import { queries } from "../graphql";

export const getRefetchQueries = () => {
  return [
    {
      query: queries.payments,
      variables: {
        paymentIds: [],
      },
    },
    {
      query: queries.paymentsTotalCountQuery,
    },
  ];
};

export const getGqlString = (doc) => {
  return doc.loc && doc.loc.source.body;
};

export const getSubMenu = () => {
  const subMenu = [{ title: "Payments", link: "/settings/payments" }];

  // TODO: add this back when component changed for any plugins
  // if (
  //   subMenu.findIndex(m => m.link === '/payment/configs') === -1 &&
  //   isEnabled('products') &&
  //   isEnabled('inbox')
  // ) {
  //   subMenu.push({
  //     title: 'Plugins Configs',
  //     link: '/payment/configs'
  //   });
  // }

  return subMenu;
};
