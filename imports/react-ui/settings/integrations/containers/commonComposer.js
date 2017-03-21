import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { saveCallback } from './utils';

export default ({ addMethodName, editMethodName }) =>
  function composer(props, onData) {
    const brandsHandler = Meteor.subscribe('brands.list', 0);
    const brands = Brands.find().fetch();

    const save = doc =>
      saveCallback(doc, addMethodName, editMethodName, props.integration);

    if (brandsHandler.ready()) {
      return onData(null, { brands, save });
    }

    return null;
  };
