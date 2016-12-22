import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Loader, pagination } from '/imports/react-ui/common';
import { CustomersList } from '../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'customers.list.count');
  const customersHandle = Meteor.subscribe('customers.list', Object.assign(queryParams, { limit }));
  const integrationsHandle = Meteor.subscribe('integrations.list', {});
  const customers = Customers.find({}, { sort: { lastSeenAt: -1 } }).fetch();

  if (customersHandle.ready() && integrationsHandle.ready()) {
    onData(null, { customers, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(CustomersList);
