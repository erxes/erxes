// test failed info: IDeal
// import { mount, shallow } from 'enzyme';
// import * as React from 'react';
// import DealColumn from '../../../../modules/deals/components/calendar/Calendar';
// import { IDeal, IPipeline } from '../../../../modules/deals/types';
// import { IUser } from '../../../../modules/auth/types';
// import { ICompany, ICompanyLinks } from '../../../../modules/companies/types';
// import { ICustomer } from '../../../../modules/customers/types';
// import { ITag } from '../../../../modules/tags/types';
// describe('DealColumn component', () => {

//   const testTags:ITag[] = [
//     {
//       _id: "tag1",
//       type: "tagType",
//       name: "tagName",
//       colorCode: "blue"
//     },
//     {
//       _id: "tag2",
//       type: "tagType",
//       name: "tagName",
//       colorCode: "green"
//     }
//   ]

//   const testUsers:IUser[] = [
//     {
//       _id: "u123",
//       username: "john",
//       email: "J@a.co"
//     }
//   ]

//   // const testCompany:ICompany = {
//   //   _id: "c1",
//   //   owner: testUsers[0],
//   //   parentCompany: testCompanies[0],

//   // };
//   const testCompanyLinks:ICompanyLinks = {

//   };

//   const testCompanies:ICompany[] = [
//     {
//       _id: "c12",
//       owner: testUsers[1],
//       parentCompany: testCompanies[0],
//       getTags: testTags,
//       customers: testCustomers,
//       links: testCompanyLinks
//     },

//   ]

//   const testCustomers:ICustomer[] = [
//     {
//       _id: "c1",
//       getTags: testTags,
//       companies: testCompanies,
//       firstName: "John",
//       lastName: "JJ"
//     }
//   ];

//   const testPipeline:IPipeline = {
//     _id: "pip1",
//     name: "pipName"
//   };
//   const testDeals:IDeal[] = [
//     {
//       _id: "deal123",
//       name: "dealy",
//       order: 1,
//       stageId: "q12",
//       closeDate: new Date,
//       amount: 150,
//       modifiedAt: new Date,
//       assignedUsers: testUsers,
//       companies: testCompanies,
//       customers: testCustomers,
//       pipeline: testPipeline,
//       products: "bla"
//     }
//   ]

//   const defaultProps = {
//     deals: testDeals,
//     date: IDateColumn,
//     dealTotalAmounts: IDealTotalAmount,
//     onUpdate: (deal: IDeal) => null,
//     onRemove: () => null,
//     onLoadMore: (skip: number) => null
//   };

//   test('renders successfully', () => {
//     shallow(<DealColumn {...defaultProps} />);
//   });

//   test('renders with default props', () => {
//     const control = mount(<DealColumn {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
