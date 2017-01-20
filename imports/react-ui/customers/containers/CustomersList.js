import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { Brands } from '/imports/api/brands/brands';
import { Tags } from '/imports/api/tags/tags';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Loader, pagination } from '/imports/react-ui/common';
import { CustomersList } from '../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'customers.list.count');

  const customersHandle = Meteor.subscribe('customers.list', Object.assign(queryParams, { limit }));

  /**
   * We need to display all 'brands' on the Sidebar
   * even if no customers are related to them.
   * So these subscriptions are made here separately
   * instead of being made in customers subscription (composite subscription).
   */
  const brandsHandle = Meteor.subscribe('brands.list', 100);
  const tagsHandle = Meteor.subscribe('tags.tagList', TAG_TYPES.CUSTOMER);

  const customers = Customers.find({}, { sort: { lastSeenAt: -1 } }).fetch();
  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();
  const integrations = KIND_CHOICES.ALL_LIST;
  const tags = Tags.find({ type: TAG_TYPES.CUSTOMER }).fetch();

  if (customersHandle.ready() && brandsHandle.ready() && tagsHandle.ready()) {
    onData(null, { customers, brands, integrations, tags, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(CustomersList);
