import { IModels } from "../connectionResolver";

export async function loanExpiredReportData(models:IModels,filter:any) {
    const contracts = await models.Contracts.find(filter)
    return contracts
}

export async function loanDetailReportData(models:IModels,filter:any) {
    const contracts = await models.Contracts.find(filter)
    return contracts
}