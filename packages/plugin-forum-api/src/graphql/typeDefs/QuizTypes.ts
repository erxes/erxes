import { QUIZ_STATES } from '../../db/models/quiz';

const QuizTypes = `

enum ForumQuizState {
    ${QUIZ_STATES.join('\n')}
}

type ForumQuiz @key(fields: "_id") @cacheControl(maxAge: 60) {
    _id: ID!

    postId: ID
    companyId: ID
    tagIds: [ID!]
    categoryId: ID

    state: ForumQuizState!
  
    name: String
    description: String  
    isLocked: Boolean!

    questions: [ForumQuizQuestion!]
    company: Company
    tags: [Tag]
    category: ForumCategory
    post: ForumPost
}

type ForumQuizQuestion @key(fields: "_id") @cacheControl(maxAge: 60) {
    _id: ID!
    quizId: ID!
    text: String
    imageUrl: String
    isMultipleChoice: Boolean!
    listOrder: Float!

    choices: [ForumQuizChoice!]
}

type ForumQuizChoice @key(fields: "_id") @cacheControl(maxAge: 60) {
    _id: ID!
    quizId: ID!
    questionId: ID!
    text: String
    imageUrl: String
    isCorrect: Boolean!
    listOrder: Float!
}

`;

export default QuizTypes;
