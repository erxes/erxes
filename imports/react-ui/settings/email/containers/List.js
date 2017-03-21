import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { Loader } from '/imports/react-ui/common';
import { List } from '../components';


function composer(props, onData) {
  const brandsHandle = Meteor.subscribe('brands.list', 0);

  if (brandsHandle.ready()) {
    const selector = { userId: Meteor.userId() };
    const brands = Brands.find(selector).fetch();

    onData(null, { brands });
  }
}

export default compose(getTrackerLoader(composer), Loader)(List);
