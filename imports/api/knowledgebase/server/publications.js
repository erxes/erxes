/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { KbTopics, KbCategories, KbArticles } from '../collections';

// topic list
Meteor.publish('kb_topics.list', function kbTopicsList(params) {
  check(params, {
    limit: Match.Optional(Number),
  });

  Counts.publish(this, 'kb_topics.list.count', KbTopics.find({}, {}), {
    noReady: true,
  });

  let options = {};
  if (params.limit == null || params.limit === 0) {
    options = { limit: params.limit || 20 };
  }

  return KbTopics.find({}, options);
});

// topic detail
Meteor.publish('kb_topics.detail', id => {
  check(id, String);

  return KbTopics.find({ createdUser: this.userId, _id: id });
});

// category list
Meteor.publish('kb_categories.list', function kbCategoriesList(params) {
  check(params, {
    limit: Match.Optional(Number),
  });

  Counts.publish(this, 'kb_categories.list.count', KbCategories.find({}, {}), {
    noReady: true,
  });

  let options = {};
  if (params.limit == null || params.limit === 0) {
    options = { limit: params.limit || 20 };
  }
  return KbCategories.find({}, options);
});

// category detail
Meteor.publish('kb_categories.detail', id => {
  check(id, String);

  return KbCategories.find({ createdUser: this.userId, _id: id });
});

// article list
Meteor.publish('kb_articles.list', function kbArticlesList(params) {
  check(params, {
    limit: Match.Optional(Number),
  });

  Counts.publish(this, 'kb_articles.list.count', KbArticles.find({}, {}), {
    noReady: true,
  });

  let options = {};
  if (params.limit == null || params.limit === 0) {
    options = { limit: params.limit || 20 };
  }

  return KbArticles.find({}, options);
});

// article detail
Meteor.publish('kb_articles.detail', id => {
  check(id, String);

  return KbArticles.find({ createdUser: this.userId, _id: id });
});
