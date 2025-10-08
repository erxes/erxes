export const types = `

    extend type User @key(fields: "_id") {
        _id: String @external
    }  

    type Channel {
        _id: String!
        icon: String
        name: String!
        description: String
        createdAt: Date
        updatedAt: Date
        memberCount: Int
    }

    type ChannelMember {
        _id: String!
        memberId: String!
        channelId: String!
        member: User
        role: String
    }
`;

export const queries = `
    getChannel(_id: String!): Channel
    getChannels(name: String, userId: String, channelIds: [String], integrationId: String): [Channel]
    getChannelMembers(channelId: String, channelIds: [String]): [ChannelMember]
`;

export const mutations = `
    channelAdd(name: String!, icon: String,description: String, memberIds: [String]): Channel
    channelUpdate(_id: String!, name: String, description: String, icon: String, memberIds: [String]): Channel
    channelRemove(_id: String!): Channel
    channelAddMembers(_id: String!, memberIds: [String]): [ChannelMember]
    channelRemoveMember(channelId: String!, memberId: String!): ChannelMember
    channelUpdateMember(_id: String!, role: String): ChannelMember
`;
