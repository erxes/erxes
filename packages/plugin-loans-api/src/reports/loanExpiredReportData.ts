import { IModels } from "../connectionResolver";

export async function loanExpiredReportData(models:IModels,filter:any) {

    const result = await models.Contracts.aggregate([
        {
          $group: {
            _id: "$classification", 
            total_groups: { $sum: 1 },
          }
        }
      ]);

    return result
}