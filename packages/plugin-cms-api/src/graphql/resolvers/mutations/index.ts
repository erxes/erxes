import categoryMutations from './category';
import postMutations from './post';
import pageMutations from './page';

export default {
    ...categoryMutations,
    ...postMutations,
    ...pageMutations  
}