import { compose } from 'react-komposer';
import { Brands } from '/imports/api/brands/brands';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { PunchCard } from '../components';
import { Mongo } from 'meteor/mongo';

const MainData = new Mongo.Collection('punch_card');

function composer({ queryParams }, onData) {
  const handle = Meteor.subscribe('insights.punch.card', queryParams);
  const brandHandle = Meteor.subscribe('brands.list', 0);

  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (brandHandle.ready() && handle.ready()) {
    const data = MainData.find().fetch();

    onData(null, {
      data,
      brands,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(PunchCard);
