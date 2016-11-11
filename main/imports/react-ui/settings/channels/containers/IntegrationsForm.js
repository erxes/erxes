import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { Spinner } from '/imports/react-ui/common';
import { IntegrationsForm } from '../components';


function composer({ channel }, onData) {
  const brandsHandle = Meteor.subscribe('brands.list');

  const brands = Brands.find({ userId: Meteor.userId() }).fetch();
  const manageIntegrations = (params, callback) => {
    callback(new Meteor.Error('Not implemented', 'Not implemented'));
  };

  if (brandsHandle.ready()) {
    onData(null, { channel, brands, manageIntegrations });
  }
}

export default composeWithTracker(composer, Spinner)(IntegrationsForm);
