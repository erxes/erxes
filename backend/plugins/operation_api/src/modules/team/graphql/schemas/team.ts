export const types = `
    extend type User @key(fields: "_id") {
       _id: String @external
    }

    type Team {
        _id: String
        icon: String
        name: String
        description: String
        estimateType: Int 
        createdAt: Date
        updatedAt: Date
        cycleEnabled: Boolean

        taskCount: Int
        memberCount: Int
    }

    type TeamMember {
        _id: String
        memberId: String
        teamId: String

        member: User
        role: String
    }
`;

export const queries = `
    getTeam(_id: String!): Team
    getTeams(name: String, userId: String, teamIds: [String], projectId: String): [Team]
    getTeamMembers(teamId: String, teamIds: [String]): [TeamMember]
    getTeamEstimateChoises(teamId: String): JSON
`;

export const mutations = `
    teamAdd(name: String!, description: String, icon: String!, memberIds: [String]): Team
    teamUpdate(_id: String!, name: String, description: String, icon: String, memberIds: [String], estimateType: Int, cycleEnabled: Boolean): Team
    teamRemove(_id: String!): Team
    teamAddMembers(_id: String!, memberIds: [String]): [TeamMember]
    teamRemoveMember(teamId: String!, memberId: String!): TeamMember
    teamUpdateMember(_id: String!, role: String): TeamMember
`;
