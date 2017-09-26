import {
  SWITCH_TO_ARTICLE_DISPLAY,
  SWITCH_TO_CATEGORY_DISPLAY,
  SWITCH_TO_TOPIC_DISPLAY,
  UPDATE_SEARCH_STRING,
} from './constants';

/**
 * Switch to Article detail
 */
export const switchToArticleDisplay = (data) => {
  return {
    type: SWITCH_TO_ARTICLE_DISPLAY,
    data,
  };
};

/**
 * Switch to Category Detail
 */
export const switchToCategoryDisplay = (data) => {
  return {
    type: SWITCH_TO_CATEGORY_DISPLAY,
    ...data,
  };
};

/**
 * Switch to Topic (root) display
 */
export const switchToTopicDisplay = () => {
  return {
    type: SWITCH_TO_TOPIC_DISPLAY,
    searchStr: '',
  };
};

/**
 * updates search string, and switches to article list display
 */
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
