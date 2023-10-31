const quizMutations = `
    forumQuizCreate(
        postId: ID
        companyId: ID
        categoryId: ID
        tagIds: [ID!]
      
        name: String
        description: String
    ): ForumQuiz!

    forumQuizPatch(
        _id: ID!
        postId: ID
        companyId: ID
        categoryId: ID
        tagIds: [ID!]
      
        name: String
        description: String
    ): ForumQuiz!

    forumQuizDelete(_id: ID!): ForumQuiz!

    forumQuizQuestionCreate(
        quizId: ID!
        text: String
        imageUrl: String
        isMultipleChoice: Boolean!
        listOrder: Float!
    ): ForumQuizQuestion!

    forumQuizQuestionPatch(
        _id: ID!
        text: String
        imageUrl: String
        isMultipleChoice: Boolean
        listOrder: Float
    ): ForumQuizQuestion!

    forumQuizQuestionDelete(_id: ID!): ForumQuizQuestion!

    forumQuizChoiceCreate(
        quizId: ID!
        questionId: ID!
        text: String
        imageUrl: String
        isCorrect: Boolean!
        listOrder: Float!
    ): ForumQuizChoice!

    forumQuizChoicePatch(
        _id: ID!
        text: String
        imageUrl: String
        isCorrect: Boolean
        listOrder: Float
    ): ForumQuizChoice!

    forumQuizChoiceDelete(_id: ID!): ForumQuizChoice!

    forumQuizSetState(_id: ID!, state: ForumQuizState!): Boolean
`;

export default quizMutations;
