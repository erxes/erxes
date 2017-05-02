import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Loader } from '/imports/react-ui/common';
import { Customers } from '/imports/api/customers/customers';
import { Preview } from '../components';

function composer({ segment }, onData) {
  const limit = parseInt(FlowRouter.getQueryParam('limit'), 10) || 20;
  const customersHandle = Meteor.subscribe('customers.listForSegmentPreview', segment, limit);

  if (customersHandle.ready()) {
    const customers = Customers.find(
      {},
      { sort: { 'inAppMessagingData.lastSeenAt': -1 }, limit },
    ).fetch();

    onData(null, {
      customers,
      customerFields: Customers.getPublicFields(),
    });
  }
}

const options = {
  loadingHandler: Loader,
  propsToWatch: ['segment'],
  shouldSubscribe(currentProps, nextProps) {
    return (
      currentProps.segment.connector !== nextProps.segment.connector ||
      currentProps.segment.conditions !== nextProps.segment.conditions
    );
  },
};

export default compose(getTrackerLoader(composer), options)(Preview);
