const commonInput = `
code: String
content: String
description: String
title: String
thumbnail: String
custom: JSON
customIndexed: JSON
listOrder: Float
`;

const forumPageMutations = `
    forumCreatePage(
        ${commonInput}
    ): ForumPage
    forumPatchPage(
        _id: ID!
        ${commonInput}
    ): ForumPage
    forumDeletePage(_id: ID!): ForumPage
`;

export default forumPageMutations;
