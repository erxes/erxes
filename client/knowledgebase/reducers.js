import {
  SWITCH_TO_ARTICLE_DISPLAY,
  SWITCH_TO_CATEGORY_DISPLAY,
  SWITCH_TO_TOPIC_DISPLAY,
  UPDATE_SEARCH_STRING,
  CONTENT_TYPE_ARTICLE,
  CONTENT_TYPE_CATEGORY,
  CONTENT_TYPE_TOPIC,
  CONTENT_TYPE_SEARCH,
} from './constants';
import { connection } from './connection';

const displayType = (
  state = {
    displayType: CONTENT_TYPE_TOPIC,
    topicData: {
      topicId: connection.data.topicId,
      searchStr: '',
    } }, action) => {
  switch (action.type) {
    case SWITCH_TO_ARTICLE_DISPLAY: {
      return {
        displayType: CONTENT_TYPE_ARTICLE,
        ...action,
      };
    }
    case SWITCH_TO_CATEGORY_DISPLAY: {
      return {
        displayType: CONTENT_TYPE_CATEGORY,
        category: action.category,
      };
    }
    case SWITCH_TO_TOPIC_DISPLAY: {
      return {
        displayType: CONTENT_TYPE_TOPIC,
        topicData: {
          topicId: action.topicId,
          searchStr: action.searchStr,
        },
      };
    }
    case UPDATE_SEARCH_STRING: {
      return {
        displayType: CONTENT_TYPE_SEARCH,
        topicData: {
          topicId: connection.data.topicId,
          searchStr: action.searchStr,
        },
      };
    }
    default: {
      return state;
    }
  }
};

const knowledgeBase = {
  displayType,
};

export default knowledgeBase;
