import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbGroups } from '/imports/api/knowledgebase/collections';
import { Brands } from '/imports/api/brands/brands';
import { pagination } from '/imports/react-ui/common';
import { List } from '../components';

function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_groups.list.count'); // TODO
  const kbGroupsHandler = Meteor.subscribe('kb_groups.list', Object.assign(queryParams, { limit }));
  const brandsHandler = Meteor.subscribe('brands.list', 0);

  const kbGroups = KbGroups.find().fetch();
  const brands = Brands.find().fetch();

  const removeKbGroup = (id, callback) => {
    Meteor.call('kb_groups.remove', id, callback);
  };

  if (kbGroupsHandler.ready() && brandsHandler.ready()) {
    onData(null, {
      kbGroups,
      brands,
      removeKbGroup,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);
