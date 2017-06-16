import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import { CustomerDetails } from '../components';

function composer({ id }, onData) {
  const customerHandle = Meteor.subscribe('customers.details', id);

  if (customerHandle.ready()) {
    const customer = Customers.findOne(id);
    const conversations = Conversations.find({}, { sort: { createdAt: -1 } }).fetch();

    onData(null, { customer, conversations });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(CustomerDetails);
