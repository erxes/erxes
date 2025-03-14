import { commonFilters } from './common';

export const types = `

  type ScoreLogItem {
    ownerId: String
    ownerType: String
    changeScore: Float
    description: String
    createdBy: String
    createdAt: Date
    targetId: String
    campaignId: String
    target: JSON
    action: String
    type: String
    campaign: ScoreCampaign
  }

  type ScoreLog {
    ownerId: String
    ownerType: String

    owner: JSON
    scoreLogs : [ScoreLogItem]
  }

  type List {
    list : [ScoreLog],
    total: Int
  }
`;

export const queries = `
  scoreLogs(${commonFilters},campaignId:String): [ScoreLog]
  scoreLogList(${commonFilters},campaignId:String,orderType:String,order:String,fromDate:String,toDate:String):List
  scoreLogStatistics(${commonFilters},campaignId:String,orderType:String,order:String,fromDate:String,toDate:String): JSON
`;
export const mutation = `
  changeScore( ownerType: String, ownerId: String, changeScore: Int, description: String, createdBy: String,campaignId:String ):JSON
`;
