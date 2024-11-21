import categoryQueries from './category';
import postQueries from './post';
import pageQueries from './page';
import tagQueries from './tag';

export default {
    ...categoryQueries,
    ...postQueries,
    ...pageQueries,
    ...tagQueries
}