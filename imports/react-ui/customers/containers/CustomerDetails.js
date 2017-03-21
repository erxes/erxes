import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import { Loader } from '/imports/react-ui/common';
import { CustomerDetails } from '../components';


function composer({ id }, onData) {
  const customerHandle = Meteor.subscribe('customers.details', id);

  const customer = Customers.findOne(id);
  const conversations = Conversations.find({}, { sort: { createdAt: -1 } }).fetch();

  if (customerHandle.ready()) {
    onData(null, { customer, conversations });
  }
}

export default compose(getTrackerLoader(composer), Loader)(CustomerDetails);
