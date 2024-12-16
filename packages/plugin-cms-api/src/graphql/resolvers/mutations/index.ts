import categoryMutations from './category';
import postMutations from './post';
import pageMutations from './page';
import tagMutations from './tag';
import menuMutations from './menu';

export default {
    ...categoryMutations,
    ...postMutations,
    ...pageMutations,
    ...tagMutations,
    ...menuMutations
}