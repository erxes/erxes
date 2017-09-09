import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { VolumeReport } from '../components';
import { PunchCardData, MainGraph, InsightData } from '/imports/api/insights/collections';

function composer({ queryParams }, onData) {
  const integrationHandle = Meteor.subscribe('insights.volume', queryParams);
  const teamMembersHandle = Meteor.subscribe('insights.teamMembers', queryParams, 'volume');
  const punchCardHandle = Meteor.subscribe('insights.punch.card', queryParams, 'volume');

  const brandHandle = Meteor.subscribe('brands.list', 0);

  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  if (
    brandHandle.ready() &&
    integrationHandle.ready() &&
    teamMembersHandle.ready() &&
    punchCardHandle.ready()
  ) {
    const insights = InsightData.find().fetch();
    const trend = MainGraph.find().fetch();
    const punch = PunchCardData.find().fetch();

    onData(null, {
      insights,
      trend,
      brands,
      punch,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(VolumeReport);
