import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Customers } from '/imports/api/customers/customers';
import Segments from '/imports/api/customers/segments';
import { Brands } from '/imports/api/brands/brands';
import { Tags } from '/imports/api/tags/tags';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { pagination } from '/imports/react-ui/common';
import { toggleBulk as commonToggleBulk } from '/imports/react-ui/common/utils';
import { CustomersList } from '../components';

const bulk = new ReactiveVar([]);

function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'customers.list.count');

  const customersHandle = Meteor.subscribe('customers.list', Object.assign(queryParams, { limit }));

  /**
   * We need to display all 'segments', 'brands' and 'tags' on the Sidebar
   * even if no customers are related to them.
   * So these subscriptions are made here separately
   * instead of being made in customers subscription (composite subscription).
   */
  const segmentsHandle = Meteor.subscribe('customers.segments');
  const brandsHandle = Meteor.subscribe('brands.list', 100);
  const tagsHandle = Meteor.subscribe('tags.tagList', TAG_TYPES.CUSTOMER);

  // actions ===========
  const toggleBulk = (customer, toAdd) => commonToggleBulk(bulk, customer, toAdd);

  if (
    customersHandle.ready() && segmentsHandle.ready() && brandsHandle.ready() && tagsHandle.ready()
  ) {
    onData(null, {
      // If there's no customer fields config, all fields will be selected
      customerFields: (Meteor.user() &&
        Meteor.user().configs &&
        Meteor.user().configs.customerFields) ||
        Customers.getPublicFields(),

      customers: Customers.find({}, { sort: { 'messengerData.lastSeenAt': -1 } }).fetch(),
      segments: Segments.find({}, { sort: { name: 1 } }).fetch(),
      brands: Brands.find({}, { sort: { name: 1 } }).fetch(),
      integrations: KIND_CHOICES.ALL_LIST,
      tags: Tags.find({ type: TAG_TYPES.CUSTOMER }).fetch(),
      loadMore,
      hasMore,
      bulk: bulk.get(),
      toggleBulk,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ loading: true }))(
  CustomersList,
);
