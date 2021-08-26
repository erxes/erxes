export const types = `
    type Booking {
        _id: String!
    }

    type Card {
        _id: String
    }

`;

export const queries = ``;

const mutationParams = `
    size: String!
    margin: String
    font: String
    color: String
    image: String
`;

export const mutations = `
    bookingsAdd(${mutationParams}): Booking
    bookingsEdit(_id: String! ${mutationParams}): Booking
    bookingsRemove(_id: String!): JSON
`;
