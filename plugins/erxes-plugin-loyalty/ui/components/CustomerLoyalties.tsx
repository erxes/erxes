import { __, formatValue, renderFullName, Table, Wrapper, DataWithLoader } from 'erxes-ui';
import React from 'react';
import { ICustomer, ILoyalty, ICustomerLoyalty } from '../types';

type IProps = {
  customerId?: string;
  loyalties: ILoyalty[];
  customer?: ICustomer,
  loyalty: ICustomerLoyalty
};

class CustomerLoyalties extends React.Component<IProps, {}> {
  renderRow(loyalty) {
    return (
      <tr>
        <td key={'modifiedDate'}>{formatValue(loyalty.modifiedAt)} </td>
        <td key={'value'}>{formatValue(loyalty.value)}</td>
        <td key={'deal'}>{loyalty.deal && loyalty.deal.name || '--'}</td>
        <td key={'user'}>{loyalty.user && loyalty.user.fullName}</td>
      </tr>
    )
  }

  renderTable(loyalties) {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>
              Date
            </th>
            <th>
              Amount
            </th>
            <th>
              Deal
            </th>
            <th>
              User
            </th>
          </tr>
        </thead>
        <tbody id="loyalties">
          {loyalties.map(loyalty => (
            this.renderRow(loyalty)
          ))}
        </tbody>
      </Table>
    )
  }

  renderContent(loyalties) {
    return (
      <DataWithLoader
        data={this.renderTable(loyalties)}
        emptyText={__('There are no loyalty row')}
        emptyImage="/images/actions/21.svg">

      </DataWithLoader>
    )
  }

  render() {
    const { loyalties, customer, loyalty } = this.props;

    const breadcrumb = [
      { title: __('Contacts'), link: '/contacts' },
      { title: renderFullName(customer || ''), link: `/contacts/details/${loyalty.customerId}` },
      { title: `Sum Loyalty: ( ${loyalty.loyalty} )` }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            breadcrumb={breadcrumb}
          />
        }
        content={this.renderContent(loyalties)}
        transparent={true}
      />
    );
  }
}
export default CustomerLoyalties;
