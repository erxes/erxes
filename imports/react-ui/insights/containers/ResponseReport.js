import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { ResponseReport } from '../components';
import { PunchCardData, MainGraph, UsersData, Summary } from '/imports/api/insights/collections';

function composer({ queryParams }, onData) {
  const teamMembersHandle = Meteor.subscribe('insights.teamMembers', queryParams, 'response');
  const punchCardHandle = Meteor.subscribe('insights.punch.card', queryParams, 'response');
  const brandHandle = Meteor.subscribe('brands.list', 0);

  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (brandHandle.ready() && teamMembersHandle.ready() && punchCardHandle.ready()) {
    const trend = MainGraph.find().fetch();
    const teamMembers = UsersData.find().fetch();
    const punch = PunchCardData.find().fetch();
    const summary = Summary.find().fetch();

    onData(null, {
      trend,
      teamMembers,
      brands,
      punch,
      summary,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(ResponseReport);
