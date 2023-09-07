export const types = `
    type Address {
        formattedAddress: String
        description: String
        latitude: Float
        longitude: Float
        country: String
        city: String
        street: String
        district: String
        quarter: String

        building: String
        postalCode: String

        boundingBox: [Float]
    }

    input LocationInput {
        lat: Float!
        lng: Float!
    }
`;

export const queries = `
    mapsReverseGeocoding(location: LocationInput!, language: String): Address
    mapsGeocoding(query: String!, language: String): [Address]
    mapsDistanceMatrix(origins: [String]!, destinations: [String]!, mode: String, language: String): JSON
    mapsRoute(origin: LocationInput!, destination: LocationInput!, mode: String, language: String): JSON
`;
