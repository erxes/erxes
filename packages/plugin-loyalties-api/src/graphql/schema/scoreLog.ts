export const types = `
  type ScoreLog {
    ownerId: String
    ownerType: String
    changeScore: Float
    description: String
    createdBy: String
    createdAt: Date

    owner: JSON
  }
  type List {
    list : [ScoreLog],
    total: Int
  }
`;

export const queries = `
  scoreLogs(ownerType: String, ownerId: String, searchValue: String): [ScoreLog]
  scoreLogList(ownerType:String,orderType:String,order:String,fromDate:String,toDate:String):List
`;
export const mutation = `
changeScore(  ownerType: String,
  ownerId: String,
  changeScore: Int,
  description: String,
  createdBy: String):JSON
`;
