import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { remove } from '/imports/api/integrations/methods';
import { Loader } from '/imports/react-ui/common';
import { IntegrationList } from '../components';


function composer(props, onData) {
  const integrationsHandler = Meteor.subscribe('integrations.list', {});
  const brandsHandler = Meteor.subscribe('brands.list');

  const integrations = Integrations.find().fetch();
  const brands = Brands.find().fetch();

  const removeIntegration = (id, callback) => {
    remove.call(id, callback);
  };

  if (integrationsHandler.ready() && brandsHandler.ready()) {
    onData(null, { integrations, brands, removeIntegration });
  }
}

export default composeWithTracker(composer, Loader)(IntegrationList);
