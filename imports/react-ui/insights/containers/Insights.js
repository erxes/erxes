import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { Insights } from '../components';

const Integration = new Mongo.Collection('integration');

function composer({ queryParams }, onData) {
  const integrationHandle = Meteor.subscribe('insights.integration', queryParams);
  const brandHandle = Meteor.subscribe('brands.list', 0);

  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (brandHandle.ready() && integrationHandle.ready()) {
    const data = Integration.find().fetch();

    onData(null, {
      data,
      brands,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Insights);
