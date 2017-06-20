import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { pagination } from '/imports/react-ui/common';
import { Sidebar } from '../components';

function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'customers.list.count');

  Meteor.subscribe('customers.list', Object.assign(queryParams, { limit }));

  onData(null, {
    customers: Customers.find({}, { sort: { 'messengerData.lastSeenAt': -1 } }).fetch(),
    integrations: KIND_CHOICES.ALL_LIST,
    loadMore,
    hasMore,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Sidebar);
