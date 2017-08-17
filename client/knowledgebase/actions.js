import {
  SWITCH_TO_ARTICLE_DISPLAY,
  SWITCH_TO_CATEGORY_DISPLAY,
  SWITCH_TO_TOPIC_DISPLAY,
  UPDATE_SEARCH_STRING,
} from './constants';

export const switchToArticleDisplay = (data) => {
  console.log('article dispatch.data: ', data);
  return {
    type: SWITCH_TO_ARTICLE_DISPLAY,
    data,
  };
};

export const switchToCategoryDisplay = (data) => {
  console.log('category dispatch.data: ', data);
  return {
    type: SWITCH_TO_CATEGORY_DISPLAY,
    ...data, // todo
  };
};

export const switchToTopicDisplay = (data) => {
  console.log('topic dispatch.dispatch: ', data)
  return {
    type: SWITCH_TO_TOPIC_DISPLAY,
    searchStr: '',
  };
};

export const updateSearchString = (searchStr) => {
  console.log('updateSearchString.dispatch.dispatch: ', searchStr)
  return {
    type: UPDATE_SEARCH_STRING,
    searchStr,
  };
};
