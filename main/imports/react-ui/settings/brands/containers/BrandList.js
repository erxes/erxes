import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Brands } from '/imports/api/brands/brands';
import { remove } from '/imports/api/brands/methods';
import { Loader } from '/imports/react-ui/common';
import { BrandList } from '../components';

const pageNumber = new ReactiveVar(1);
const BRANDS_PER_PAGE = 5;
function composer(props, onData) {
  let hasMore = false;
  const limit = BRANDS_PER_PAGE * pageNumber.get();
  const brandCount = Counts.get('brands.list.count');
  const subHandle = Meteor.subscribe('brands.list', limit);
  const brands = Brands.find().fetch();

  const loadMore = () => {
    pageNumber.set(pageNumber.get() + 1);
  };

  if (brandCount > limit) {
    hasMore = true;
  }
  console.log(brandCount);

  const removeBrand = (id, callback) => {
    remove.call(id, callback);
  };

  if (subHandle.ready()) {
    onData(null, { brands, removeBrand, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(BrandList);
