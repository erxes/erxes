import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Loader } from '/imports/react-ui/common';
import { List } from '../components';


function composer({ queryParams }, onData) {
  const params = queryParams || {};
  const integrationsHandler = Meteor.subscribe('integrations.list', params);
  const brandsHandler = Meteor.subscribe('brands.list');

  const integrations = Integrations.find().fetch();
  const brands = Brands.find().fetch();

  const removeIntegration = (id, callback) => {
    Meteor.call('integrations.remove', id, callback);
  };

  if (integrationsHandler.ready() && brandsHandler.ready()) {
    onData(null, { integrations, brands, removeIntegration });
  }
}

export default composeWithTracker(composer, Loader)(List);
