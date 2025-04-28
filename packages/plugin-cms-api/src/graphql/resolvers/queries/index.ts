import categoryQueries from './category';
import postQueries from './post';
import pageQueries from './page';
import tagQueries from './tag';
import menuQueries from './menu';
import customPostTypeQueries from './customPostType';

export default {
    ...categoryQueries,
    ...postQueries,
    ...pageQueries,
    ...tagQueries,
    ...menuQueries,
    ...customPostTypeQueries
}