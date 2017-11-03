export const requireLogin = (cls, methodName) => {
  console.log('bbb');
  const oldMethod = cls[methodName];

  cls[methodName] = (root, object2, { user }) => {
    if (!user) {
      throw new Error('Login required');
    }

    console.log('ccc');
    return oldMethod(root, object2, { user });
  };
};

export const moduleRequireLogin = mdl => {
  for (let method in mdl) {
    requireLogin(mdl, method);
  }
};

// import mutations from './resolvers/mutations';
// import queries from './resolvers/queries';
// import knowledgeBaseQueries from './resolvers/queries/knowledgeBase';
// import knowledgeBaseMutations from './resolvers/mutations/knowledgeBase';

// export const setAuthPermissions = () => {
//   console.log('setAuthPermissions');
//   for (let mutation in mutations) {
//     requireLogin(mutations, mutation);
//   }
//
//   for (let query in queries) {
//     requireLogin(queries, query);
//   }
//
//   for (let query in knowledgeBaseQueries) {
//     requireLogin(knowledgeBaseQueries, query);
//   }
//
//   for (let query in knowledgeBaseMutations) {
//     requireLogin(knowledgeBaseMutations, query);
//   }
// }

// setAuthPermissions();

export default {
  requireLogin,
  moduleRequireLogin,
  // setAuthPermissions,
};
