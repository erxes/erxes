import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Loader } from '/imports/react-ui/common';
import { CustomerDetails } from '../components';


function composer({ id }, onData) {
  const customerHandle = Meteor.subscribe('customers.details', id);

  const customer = Customers.findOne(id);

  if (customerHandle.ready()) {
    onData(null, { customer });
  }
}

export default composeWithTracker(composer, Loader)(CustomerDetails);
