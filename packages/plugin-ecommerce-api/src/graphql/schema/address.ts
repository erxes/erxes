export const types = `
    extend type Customer @key(fields: "_id") {
        _id: String! @external
    }

    type AddressCoordinate {
        lat: Float
        lng: Float
    }

    input AddressCoordinateInput {
        lat: Float
        lng: Float
    }

    type Address {
        _id: String
        alias: String
        customerId: String
        customer: Customer
        coordinate: AddressCoordinate
        address1: String
        address2: String
        city: String
        district: String
        street: String
        detail: String
        more: JSON
        w3w: String
        note: String
        phone: String
        createdAt: Date
        updatedAt: Date
    }
`;

const queryParams = `
    page: Int
    perPage: Int
    searchValue: String
    aliasType: String
    customerId: String
    city: String
    district: String
    street: String
`;

export const queries = `
    address(_id: String!): Address
    addressList(${queryParams}): [Address]
`;

const commonFields = `
    alias: String
    customerId: String
    coordinate: AddressCoordinateInput
    address1: String
    address2: String
    city: String
    district: String
    street: String
    detail: String
    more: JSON
    w3w: String
    note: String
    phone: String
`;

export const mutations = `
    addressAdd(${commonFields}): Address
    addressUpdate(_id: String!, ${commonFields}): Address
    addressRemove(_id: String!): JSON
`;
