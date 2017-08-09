import { SWITCH_TO_ARTICLE_DISPLAY } from './constants';

console.log('SWITCH_TO_ARTICLE_DISPLAY', SWITCH_TO_ARTICLE_DISPLAY);
export const switchToArticleDisplay = (data) => {
  console.log('dispatch: ', data);
  return {
    type: SWITCH_TO_ARTICLE_DISPLAY,
    articleData: {
      ...data,
    },
  };
};

export const switchToTopicDisplay = (dispatch) => {
  console.log('dispatch: ', dispatch);
};
