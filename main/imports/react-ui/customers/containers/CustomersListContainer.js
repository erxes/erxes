import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Customers } from '/imports/api/customers/customers';
import { Loader } from '/imports/react-ui/common';
import { CustomersList } from '../components';


function composer({ queryParams }, onData) {
  let hasMore = false;
  const CUSTOMERS_PER_PAGE = 15;
  const pageNumber = parseInt(queryParams.page, 10) || 1;
  const limit = CUSTOMERS_PER_PAGE * pageNumber;
  const params = Object.assign({ limit }, queryParams);
  const customersCount = Counts.get('customers.list.count');
  const customersHandle = Meteor.subscribe('customers.list', params);
  const integrationsHandle = Meteor.subscribe('integrations.list', {});
  const customers = Customers.find({}, { sort: { lastSeenAt: -1 } }).fetch();

  const loadMore = () => {
    const qParams = { page: pageNumber + 1 };
    FlowRouter.setQueryParams(qParams);
  };

  if (customersCount > pageNumber * CUSTOMERS_PER_PAGE) {
    hasMore = true;
  }
  if (customersHandle.ready() && integrationsHandle.ready()) {
    onData(null, { customers, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(CustomersList);
