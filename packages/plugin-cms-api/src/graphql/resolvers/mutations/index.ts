import categoryMutations from './category';
import postMutations from './post';
import pageMutations from './page';
import tagMutations from './tag';

export default {
    ...categoryMutations,
    ...postMutations,
    ...pageMutations,
    ...tagMutations
}