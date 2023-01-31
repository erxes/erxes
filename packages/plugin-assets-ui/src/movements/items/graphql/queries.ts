import { isEnabled } from '@erxes/ui/src/utils/core';
import { assetFields } from '../../../common/graphql/asset';
import {
  commonFilterParams,
  commonFilterParamsDef,
  dateFilterParams,
  dateFilterParamsDef,
  movementFilterParams,
  movementFilterParamsDef
} from '../../../common/graphql/movement';

const itemsType = `
    _id
    assetId
    assetName
    assetDetail {
      ${assetFields}
    }
    branchId
    companyId
    customerId
    departmentId
    teamMemberId
    movementId
    createdAt
    ${
      isEnabled('contacts')
        ? `
      branch
      department
      company
      customer
      teamMember

      `
        : ``
    }
`;

const items = `
query AssetMovementItems ($movementId:String,${movementFilterParams},${dateFilterParams},${commonFilterParams}) {
  assetMovementItems(movementId: $movementId,${movementFilterParamsDef},${dateFilterParamsDef},${commonFilterParamsDef}) {
    ${itemsType}
    sourceLocations {
      branchId
      departmentId
      customerId
      companyId
      teamMemberId
          ${
            isEnabled('contacts')
              ? `
              branch
              department
              company
              customer
              teamMember`
              : ``
          }
    }
    }
  }
`;

const item = `
  query AssetMovementItem($assetId: String) {
  assetMovementItem(assetId: $assetId) {
 ${itemsType}
    sourceLocations {
      branchId
      companyId
      customerId
      departmentId
      movementId
      teamMemberId

      ${
        isEnabled('contacts')
          ? `     
          branch
          department
          company
          customer
          teamMember
        `
          : ``
      }
    }
    teamMember
    teamMemberId
  }
}
`;

const itemsTotalCount = `
  query AssetMovementItemsTotalCount(${movementFilterParams},${dateFilterParams}) {
  assetMovementItemsTotalCount(${movementFilterParamsDef},${dateFilterParamsDef})
}
`;

export default { items, item, itemsTotalCount };
