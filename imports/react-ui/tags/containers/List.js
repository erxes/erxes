import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Tags } from '/imports/api/tags/tags';
import { Loader } from '/imports/react-ui/common';
import { remove } from '/imports/api/tags/methods';
import { List } from '../components';


function composer({ type }, onData) {
  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    onData(null, {
      tags: Tags.find({ type }).fetch(),
      type,
      remove,
    });
  }
}

export default composeWithTracker(composer, Loader)(List);
