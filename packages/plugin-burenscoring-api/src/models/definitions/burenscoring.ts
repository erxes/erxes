import { Schema, Document, model } from 'mongoose';
import { field, schemaWrapper } from '@erxes/api-utils/src';
import { IBurenScoringModel } from '../burenScoring';


export interface ICreditScore {
  scoringResult: number,
  badRatio: number,
  odds: number
}
export interface IMonthlyLoanRepayment {
  userMonthlyRepayment: number,
  lineTotalBaseAmount: number,
  lineTotalRemainAmount: number
}
export interface IActiveLoanInformation {
  activeLoanRemainPercent: number,
  activeLoanTotalRemainAmount: number
}
export interface IOutstanding {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}
export interface IClosed {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}

export interface ITotal {
  normal: number,
  overdue: number,
  bad: number,
  total: number
}
export interface ILoanClasses {
  outstanding: IOutstanding,
  closed: IClosed,
  total: ITotal
}
export interface ICreditSummary {
  monthlyLoanRepayment: IMonthlyLoanRepayment,
  activeLoanInformation: IActiveLoanInformation,
  loanClasses: ILoanClasses,
  percentOfOnTimeClosedLoan: number
}
export interface IDetail {
  creditScore: ICreditScore,
  creditSummary?: ICreditSummary
}
export interface ICustomer {
  firstname: string,
  lastname: string,
  address: string,
  registerno: string,
  familyname: string,
  nationality: string
}
export interface Inquiry  {
    ROWNUM: number,
    AA_ORGCODE: string,
    AA_LOANCODE: string,
    LASTNAME: string,
    CUSTOMERNAME: string,
    REGISTERNO: string,
    LOANTYPE: string,
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
export interface IGroupedPurposes
{
  count: number,
  purposeCode: number,
  purpose: string,
  description: string
}
export interface IHistories
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
      detail:IDetail,
    },
    message: string,
  },
  restInquiryResponse:{
    customer: ICustomer,
    inquiry: [Inquiry],
    groupedPurposes: [IGroupedPurposes],
    histories: [IHistories]
  },
  score: number,
  customerId: string,
  reportPurpose: string,
  vendor: string,
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
          LOANTYPE: String,
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
    vendor: String,
    customerId: String,
    keyword: String,
    reportPurpose: String,
    createdBy: String,
    createdAt:Date
  }),
);
export const Burenscorings = model<IBurenScoringDocument, IBurenScoringModel>('burenscorings', burenscoringSchema);
