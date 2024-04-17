import BigNumber from "bignumber.js";
import { IConfig } from "../../interfaces/config";
import { IContractDocument } from "../definitions/contracts";
import { calcInterest, getDatesDiffMonth, getDiffDay } from "./utils";


export async function getInterest(contract:IContractDocument,fromDate:Date,toDate:Date,balance:number,config:IConfig) {
  const diffDay = getDiffDay(fromDate,toDate)
    const { diffEve } = getDatesDiffMonth(
        fromDate,
        toDate
      );
      const interest = calcInterest({balance,interestRate:contract.interestRate,dayOfMonth:diffDay,fixed:config.calculationFixed})
      const interestEve = calcInterest({
        balance,
        interestRate: contract.interestRate,
        dayOfMonth: diffEve,
        fixed:config.calculationFixed
      });
      const interestNonce = new BigNumber(interest).minus(interestEve).dp(config.calculationFixed,BigNumber.ROUND_HALF_UP).toNumber()
      return {interest,interestEve,interestNonce,diffDay}
}