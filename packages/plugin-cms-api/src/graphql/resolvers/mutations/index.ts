import categoryMutations from './category';
import postMutations from './post';
import pageMutations from './page';
import tagMutations from './tag';
import menuMutations from './menu';
import customPostTypeMutations from './customPostType';

export default {
    ...categoryMutations,
    ...postMutations,
    ...pageMutations,
    ...tagMutations,
    ...menuMutations,
    ...customPostTypeMutations
}