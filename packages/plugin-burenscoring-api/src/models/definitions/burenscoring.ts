import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from '@erxes/api-utils/src';


export interface creditScore {
  scoringResult: number,
  badRatio: number,
  odds: number
}
export interface monthlyLoanRepayment {
  userMonthlyRepayment: number,
  lineTotalBaseAmount: number,
  lineTotalRemainAmount: number
}
export interface activeLoanInformation {
  activeLoanRemainPercent: number,
  activeLoanTotalRemainAmount: number
}
export interface outstanding {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}
export interface closed {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}

export interface  total {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}
export interface loanClasses {
  outstanding: outstanding,
  closed: closed,
  total: total
}
export interface creditSummary {
  monthlyLoanRepayment: monthlyLoanRepayment,
  activeLoanInformation: activeLoanInformation,
  loanClasses: loanClasses,
  percentOfOnTimeClosedLoan: number
}
export interface detail {
  creditScore: creditScore,
  creditSummary?: creditSummary
}
export interface customer {
  firstname: string,
  lastname: string,
  address: string,
  registerno: string,
  familyname: string,
  nationality: string
}
export interface inquiry  {
    ROWNUM: number,
    AA_ORGCODE: string,
    AA_LOANCODE: string,
    LASTNAME: string,
    CUSTOMERNAME: string,
    REGISTERNO: string,
    LOANTYPE: number,
    CURRENCYCODE: string,
    ADVAMOUNT: number,
    EXPDATE: Date,
    STARTEDDATE: Date,
    PAID_DATE: Date,
    INTERESTINPREC: number,
    BALANCE: number,
    LOANCLASS: string,
    SUBMRTNAME: [],
    STATEREGISTERNO: [],
    ORGNAME: string,
    DESCRIPTION: string,
    COREGISTERNO: string,
    COLASTNAME: string,
    COFIRSTNAME: string,
    COSTATEREGISTERNO: string,
    RELATION_TYPE: string,
    SUBMRT: [],
    HAS_CORELATION: string,
    LOAN_CLASS_CHANGED: string
  }
export interface groupedPurposes
{
  count: number,
  purposeCode: number,
  purpose: string,
  description: string
}
export interface histories
{
  requester: string,
  requestedDate: Date,
  purpose: string
}
export interface IBurenscoring {
  externalScoringResponse: {
    data: {
      uuid: string,
      requestId: string,
      detail:detail,
    },
    message: string,
  },
  restInquiryResponse:{
    customer: customer,
    inquiry: [inquiry],
    groupedPurposes: [groupedPurposes],
    histories: [histories]
  },
  score: number,
  customerId: string,
  reportPurpose: string,
  keyword: string
};
export interface IBurenScoringDocument extends IBurenscoring, Document {
  _id: string;
  createdBy: string;
  createdAt: Date;
}
export const burenscoringSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    externalScoringResponse: {
      data: {
        uuid: String,
        requestId: String,
        detail: {
          creditScore: {
            scoringResult: Number,
            badRatio: Number,
            odds: Number
          },
          creditSummary: {
            monthlyLoanRepayment: {
              userMonthlyRepayment: Number,
              lineTotalBaseAmount: Number,
              lineTotalRemainAmount: Number
            },
          activeLoanInformation: {
            activeLoanRemainPercent: Number,
            activeLoanTotalRemainAmount: Number
          },
          loanClasses: {
            outstanding: {
              normal: Number,
              overdue: Number,
              bad: Number,
              total: Number
            },
            closed: {
              normal: Number,
              overdue: Number,
              bad: Number,
              total: Number
            },
            total: {
              normal: Number,
              overdue: Number,
              bad: Number,
              total: Number
            }
          },
          percentOfOnTimeClosedLoan: String
          }
        }
      },
      message: String,
    },
    restInquiryResponse:{
      customer: {
        firstname: String,
        lastname: String,
        address: String,
        registerno: String,
        familyname: String,
        nationality: String
      },
      inquiry: [
        {
          ROWNUM: Number,
          AA_ORGCODE: String,
          AA_LOANCODE: String,
          LASTNAME: String,
          CUSTOMERNAME: String,
          REGISTERNO: String,
          LOANTYPE: Number,
          CURRENCYCODE: String,
          ADVAMOUNT: Number,
          EXPDATE: Date,
          STARTEDDATE: Date,
          PAID_DATE: Date,
          INTERESTINPREC: Number,
          BALANCE: Number,
          LOANCLASS: String,
          SUBMRTNAME: [],
          STATEREGISTERNO: [],
          ORGNAME: String,
          DESCRIPTION: String,
          COREGISTERNO: String,
          COLASTNAME: String,
          COFIRSTNAME: String,
          COSTATEREGISTERNO: String,
          RELATION_TYPE: String,
          SUBMRT: [],
          HAS_CORELATION: String,
          LOAN_CLASS_CHANGED: String
        }
      ],
      groupedPurposes: [
        {
          count: Number,
          purposeCode: Number,
          purpose: String,
          description: String
        }
      ],
      histories: [
        {
          requester: String,
          requestedDate: Date,
          purpose: String
        }
      ]
    },
    score: Number,
    customerId: String,
    keyword: String,
    reportPurpose: String,
    createdBy: String,
    createdAt:Date
  }),
);
export const Burenscorings = model<any, any>('burenscorings', burenscoringSchema);