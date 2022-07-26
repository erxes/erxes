export const types = `
  type PosSlot {
    _id: String!
    code: String
    name: String
    posId: String
  }
`;

export const queries = `
   posClientPosSlots(_id: String): [PosSlot]
`;
