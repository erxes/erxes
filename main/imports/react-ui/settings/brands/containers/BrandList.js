import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Brands } from '/imports/api/brands/brands';
import { remove } from '/imports/api/brands/methods';
import { Loader } from '/imports/react-ui/common';
import { BrandList } from '../components';


function composer({ queryParams }, onData) {
  let hasMore = false;
  const BRANDS_PER_PAGE = 10;
  const pageNumber = parseInt(queryParams.page, 10) || 1;
  const limit = BRANDS_PER_PAGE * pageNumber;
  const brandCount = Counts.get('brands.list.count');
  const subHandle = Meteor.subscribe('brands.list', limit);
  const brands = Brands.find().fetch();

  const loadMore = () => {
    const params = { page: pageNumber + 1 };
    FlowRouter.setQueryParams(params);
  };

  if (brandCount > limit) {
    hasMore = true;
  }

  const removeBrand = (id, callback) => {
    remove.call(id, callback);
  };

  if (subHandle.ready()) {
    onData(null, { brands, removeBrand, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(BrandList);
