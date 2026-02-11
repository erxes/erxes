
export const types = `

    type Appearances{
        backgroundColor : String!
        primaryColor : String!
        secondaryColor: String!
        accentColor: String!

        fontSans: String
        fontHeading: String
        fontMono: String
    }

    type Web{
    _id: String!
    clientPortalId: String!
    name: String!
    description : String
    keywords : [String!]
    domain : String!
    copyright : String!
    
    thumbnail : Attachment
    logo : Attachment
    favicon : Attachment
    
    appearances : Appearances!

    createdAt : Date
    updatedAt: Date
    }
`

export const inputs = `
    input AppearancesInput{
        backgroundColor : String!
        primaryColor : String!
        secondaryColor: String!
        accentColor: String!

        fontSans: String
        fontHeading: String
        fontMono: String
    }

    input WebInput{
        name: String!
        description : String
        keywords : [String]
        domain : String!
        copyright : String!
        
        thumbnail : AttachmentInput
        logo : AttachmentInput
        favicon : AttachmentInput
        
        appearances : AppearancesInput!
    }
`

export const queries = `
    cpGetWebList : [Web!]
    cpGetWebDetail: (_id: String!) : Web!
`

export const mutations = `
    cpCreateWeb( input: WebInput!) : Web!
    cpEditWeb( _id: String!, input WebInput! ): Web!
    cpRemoveWeb( _id: String! ): JSON
`