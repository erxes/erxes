import { SWITCH_TO_ARTICLE_DISPLAY } from './constants';

console.log('SWITCH_TO_ARTICLE_DISPLAY', SWITCH_TO_ARTICLE_DISPLAY);
export const switchToArticleDisplay = (dispatch) => {
  console.log('dispatch: ', dispatch);
  return {
    type: SWITCH_TO_ARTICLE_DISPLAY,
    articleId: dispatch
  }
};

export const switchToTopicDisplay = (dispatch) => {
  console.log('dispatch: ', dispatch);
};
