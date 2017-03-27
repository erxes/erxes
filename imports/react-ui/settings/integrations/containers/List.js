import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { pagination } from '/imports/react-ui/common';
import { List } from '../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'integrations.list.count');
  const integrationsHandler = Meteor.subscribe(
    'integrations.list',
    Object.assign(queryParams, { limit }),
  );
  const brandsHandler = Meteor.subscribe('brands.list', 0);

  const integrations = Integrations.find().fetch();
  const brands = Brands.find().fetch();

  const removeIntegration = (id, callback) => {
    Meteor.call('integrations.remove', id, callback);
  };

  if (integrationsHandler.ready() && brandsHandler.ready()) {
    onData(null, { integrations, brands, removeIntegration, loadMore, hasMore });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);
