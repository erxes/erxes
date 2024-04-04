import { isEnabled } from '@erxes/ui/src/utils/core';
import {
  dateFilterParams,
  dateFilterParamsDef,
  commonFilterParams,
  commonFilterParamsDef
} from '../../common/graphql/movement';
import { listParams, listParamDefs } from '../../asset/graphql/queries';

const fieldAviableEnabledContacts = `
    branch
    department
    company
    customer
    teamMember
`;
const commonItemFields = `
    branchId
    companyId
    customerId
    departmentId
    teamMemberId
`;

const movementDetail = `
query AssetMovement($_id: String) {
  assetMovement(_id: $_id) {
    _id
    itemIds
    createdAt
    movedAt
    userId
    description
    items {
        _id,
        assetId,
        assetDetail {
          _id,
          name
        }
        ${commonItemFields}
        createdAt
        sourceLocations {
                ${commonItemFields}
                ${isEnabled('contacts') ? fieldAviableEnabledContacts : ``}
        },

        ${isEnabled('contacts') ? fieldAviableEnabledContacts : ``}
    }
  }
}
`;

const movements = `
  query AssetMovements ($userId:String,$searchValue:String,${dateFilterParams},${commonFilterParams}) {
  assetMovements (userId:$userId,searchValue:$searchValue,${dateFilterParamsDef},${commonFilterParamsDef}) {
    _id
    itemIds
    description
    createdAt
    modifiedAt
    movedAt
    userId
    ${isEnabled('contacts') ? 'user' : ''}
  }
}
`;
const movementsTotalCount = `
  query AssetMovementTotalCount(${dateFilterParams},${commonFilterParams}) {
    assetMovementTotalCount(${dateFilterParamsDef},${commonFilterParamsDef})
  }
`;

const itemsCurrentLocation = `
query CurrentAssetMovementItems($assetIds: [String]) {
  currentAssetMovementItems(assetIds: $assetIds) {
    assetId
    assetDetail{
      _id,name
    }
    ${commonItemFields}
    ${isEnabled('contacts') ? fieldAviableEnabledContacts : ``}
    sourceLocations {
      ${commonItemFields}

      ${isEnabled('contacts') ? fieldAviableEnabledContacts : ``}
    }
  }
}
`;

const assets = `
  query assets(${listParamDefs}) {
    assets(${listParams}) {
      _id,name
    }
  }
`;

export default {
  movements,
  movementDetail,
  movementsTotalCount,
  itemsCurrentLocation,
  assets
};
