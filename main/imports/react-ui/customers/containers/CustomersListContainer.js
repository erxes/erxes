import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Brands } from '/imports/api/brands/brands';
import { Loader, pagination } from '/imports/react-ui/common';
import { CustomersList } from '../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'customers.list.count');

  const customersHandle = Meteor.subscribe('customers.list', Object.assign(queryParams, { limit }));

  /**
   * We need to display all 'brands' and 'integrations' on the Sidebar
   * even if no customers are related to them.
   * So these subscriptions are made here separately
   * instead of being made in customers subscription (composite subscription).
   */
  const brandsHandle = Meteor.subscribe('brands.list', 100);
  const integrationsHandle = Meteor.subscribe('integrations.list', {});

  const customers = Customers.find({}, { sort: { lastSeenAt: -1 } }).fetch();
  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (customersHandle.ready() && integrationsHandle.ready() && brandsHandle.ready()) {
    onData(null, { customers, brands, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(CustomersList);
