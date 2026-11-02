import { gql } from '~/gql';

export const FXA_CAPITAL_VALUATION = gql(`
  query accountingFixedAssetCapitalValuation($fixedAssetId: String!, $date: Date!, $excludeTransactionId: String) {
    fixedAssetCapitalValuation(fixedAssetId: $fixedAssetId, date: $date, excludeTransactionId: $excludeTransactionId) {
      fixedAssetId accountId depreciationAccountId count originalCost preDeprecation
      annualDepreciationRate depreciationMethod salvageValue depreciationStartDate
      depreciationThrough ready
      locations { branchId departmentId count }
    }
  }
`);
