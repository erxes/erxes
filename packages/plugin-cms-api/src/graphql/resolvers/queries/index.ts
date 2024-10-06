import categoryQueries from './category';
import postQueries from './post';

export default {
    ...categoryQueries,
    ...postQueries
}