import { gql } from '~/gql';

export const FXA_CAPITAL_VALUATION = gql(`
  query accountingFixedAssetCapitalValuation($fixedAssetId: String!, $date: Date!, $excludeTransactionId: String, $journal: String) {
    fixedAssetCapitalValuation(fixedAssetId: $fixedAssetId, date: $date, excludeTransactionId: $excludeTransactionId, journal: $journal) {
      fixedAssetId accountId depreciationAccountId count originalCost preDeprecation
      annualDepreciationRate depreciationMethod salvageValue depreciationStartDate
      revaluationLoss revaluationReserve
      taxDepreciationMethod taxAnnualDepreciationRate taxSalvageValue
      depreciationThrough ready
      locations { branchId departmentId count }
    }
  }
`);
