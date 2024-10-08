import categoryQueries from './category';
import postQueries from './post';
import pageQueries from './page';

export default {
    ...categoryQueries,
    ...postQueries,
    ...pageQueries
}