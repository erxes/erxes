import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Loader } from '/imports/react-ui/common';
import { CustomersList } from '../components';


function composer(props, onData) {
  const customersHandle = Meteor.subscribe('customers.list', {});
  const integrationsHandle = Meteor.subscribe('integrations.list', {});
  const customers = Customers.find({}, { sort: { lastSeenAt: -1 } }).fetch();

  if (customersHandle.ready() && integrationsHandle.ready()) {
    onData(null, { customers });
  }
}

export default composeWithTracker(composer, Loader)(CustomersList);
