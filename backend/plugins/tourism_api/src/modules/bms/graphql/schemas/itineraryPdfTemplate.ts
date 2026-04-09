export const types = `
  type ItineraryPdfTemplate {
    _id: String!
    itineraryId: String!
    branchId: String
    kind: String!
    name: String
    description: String
    status: String
    version: Int
    doc: JSON
    createdBy: String
    modifiedBy: String
    createdAt: Date
    modifiedAt: Date
  }

  input ItineraryPdfTemplateInput {
    itineraryId: String!
    branchId: String
    kind: String
    name: String
    description: String
    status: String
    version: Int
    doc: JSON!
  }
`;

export const queries = `
  bmsItineraryPdfTemplateDetail(
    itineraryId: String!
    kind: String
  ): ItineraryPdfTemplate
`;

export const mutations = `
  bmsItineraryPdfTemplateUpsert(
    input: ItineraryPdfTemplateInput!
  ): ItineraryPdfTemplate
`;
