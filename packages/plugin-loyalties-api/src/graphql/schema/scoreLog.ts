import { commonFilters } from './common';

export const types = `
  type ScoreLog {
    ownerId: String
    ownerType: String
    changeScore: Float
    description: String
    createdBy: String
    createdAt: Date
    targetId: String

    owner: JSON
  }
  type List {
    list : [ScoreLog],
    total: Int
  }
`;

export const queries = `
  scoreLogs(${commonFilters},campaignId:String): [ScoreLog]
  scoreLogList(${commonFilters},campaignId:String,orderType:String,order:String,fromDate:String,toDate:String):List
`;
export const mutation = `
  changeScore( ownerType: String, ownerId: String, changeScore: Int, description: String, createdBy: String,campaignId:String ):JSON
`;
