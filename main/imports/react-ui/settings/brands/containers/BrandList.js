import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { remove } from '/imports/api/brands/methods';
import { Loader } from '/imports/react-ui/common';
import { BrandList } from '../components';


function composer(props, onData) {
  const subHandle = Meteor.subscribe('brands.list');
  const brands = Brands.find().fetch();

  const removeBrand = (id, callback) => {
    remove.call(id, callback);
  };

  if (subHandle.ready()) {
    onData(null, { brands, removeBrand });
  }
}

export default composeWithTracker(composer, Loader)(BrandList);
