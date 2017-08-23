import {
  SWITCH_TO_ARTICLE_DISPLAY,
  SWITCH_TO_CATEGORY_DISPLAY,
  SWITCH_TO_TOPIC_DISPLAY,
  UPDATE_SEARCH_STRING,
} from './constants';

export const switchToArticleDisplay = (data) => {
  return {
    type: SWITCH_TO_ARTICLE_DISPLAY,
    data,
  };
};

export const switchToCategoryDisplay = (data) => {
  return {
    type: SWITCH_TO_CATEGORY_DISPLAY,
    ...data, // todo
  };
};

export const switchToTopicDisplay = (data) => {
  return {
    type: SWITCH_TO_TOPIC_DISPLAY,
    searchStr: '',
  };
};

export const updateSearchString = (searchStr) => {
  if (searchStr.length === 0) {
    return {
      type: SWITCH_TO_TOPIC_DISPLAY,
      searchStr: '',
    };
  }
  return {
    type: UPDATE_SEARCH_STRING,
    searchStr,
  };
};
