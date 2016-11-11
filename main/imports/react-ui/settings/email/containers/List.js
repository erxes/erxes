import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { List } from '../components';


function composer(props, onData) {
  const brandsHandle = Meteor.subscribe('brands.list');

  if (brandsHandle.ready()) {
    const selector = { userId: Meteor.userId() };
    const brands = Brands.find(selector).fetch();

    onData(null, { brands });
  }
}

export default composeWithTracker(composer)(List);
