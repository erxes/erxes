import {
  SWITCH_TO_ARTICLE_DISPLAY,
  SWITCH_TO_CATEGORY_DISPLAY,
  SWITCH_TO_TOPIC_DISPLAY,
  UPDATE_SEARCH_STRING,
  CONTENT_TYPE_ARTICLE,
  CONTENT_TYPE_CATEGORY,
  CONTENT_TYPE_TOPIC,
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
      console.log('aaa 1', action);
      return {
        displayType: CONTENT_TYPE_ARTICLE,
        articleData: action.articleData,
      };
    }
    case SWITCH_TO_CATEGORY_DISPLAY: {
      console.log('aaa 2', action);
      return {
        displayType: CONTENT_TYPE_CATEGORY,
        categoryData: action.categoryData,
      };
    }
    case SWITCH_TO_TOPIC_DISPLAY: {
      console.log('aaa 3', action);
      return {
        displayType: CONTENT_TYPE_TOPIC,
        topicData: {
          topicId: action.topicId,
          searchStr: action.searchStr,
        },
      };
    }
    case UPDATE_SEARCH_STRING: {
      console.log('aaa 3');
      return {
        displayType: CONTENT_TYPE_TOPIC,
        topicData: {
          topicId: connection.data.topicId,
          searchStr: action.searchStr,
        },
      };
    }
    default: {
      console.log('displayType.state: ', state);
      return state;
    }
  }
};

const knowledgeBase = {
  displayType,
};

export default knowledgeBase;
