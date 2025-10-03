export const types = `
    type Entity {
        contentType: String!
        contentId: String!
    }   

    type Relation {
        _id: String!
        entities: [Entity!]!
        createdAt: Date!
        updatedAt: Date!
    }

    input RelationInput {
        entities: [EntityInput!]!
    }

    input EntityInput {
        contentType: String!
        contentId: String!
    }
`;

export const queries = `
    getRelationsByEntity(contentType: String!, contentId: String!): [Relation!]
    getRelationsByEntities(contentTypes: [String!]!, contentIds: [String!]!): [Relation!]
`;

export const mutations = `
    createRelation(relation: RelationInput!): Relation!
    updateRelation(id: String!, relation: RelationInput!): Relation!
    deleteRelation(id: String!): String!
`;
