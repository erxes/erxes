import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { TeamMembers } from '../components';
import { MainGraph, UsersData } from '/imports/api/insights/collections';

function composer({ queryParams }, onData) {
  const insightHandle = Meteor.subscribe('insights.teamMembers', queryParams);
  const brandHandle = Meteor.subscribe('brands.list', 0);

  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (brandHandle.ready() && insightHandle.ready()) {
    const mainData = MainGraph.find().fetch();
    const usersData = UsersData.find().fetch();

    onData(null, {
      mainData,
      usersData,
      brands,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(TeamMembers);
