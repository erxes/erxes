export const types = `
    type Pos {
        _id: String
        name: String
        description: String
        createdAt: Date
    }


    type ProductGroups {
        _id: String
        name: String
        description: String
    }
`;

export const queries = `
    allPos: [Pos]
`;

export const mutations = `
  addPos(
    name: String
    description: String
  ): Pos

  editPos(
    _id: String
    name: String
    description: String
  ): Pos
`;