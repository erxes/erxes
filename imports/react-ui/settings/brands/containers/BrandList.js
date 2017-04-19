import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { remove } from '/imports/api/brands/methods';
import { pagination } from '/imports/react-ui/common';
import { BrandList } from '../components';

function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'brands.list.count');
  const subHandle = Meteor.subscribe('brands.list', limit);
  const brands = Brands.find().fetch();

  const removeBrand = (id, callback) => {
    remove.call(id, callback);
  };

  if (subHandle.ready()) {
    onData(null, { brands, removeBrand, loadMore, hasMore });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(BrandList);
