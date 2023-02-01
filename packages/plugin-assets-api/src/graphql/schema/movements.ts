import {
  movementFilters,
  commonFilterParams
} from '../../common/graphql/movement';

export const types = contactsAvailable => `

    type ItemSourceLocation {
        branchId:String,
        departmentId:String,
        customerId:String,
        movementId:String,
        teamMemberId:String,
        companyId:String,
        ${
          contactsAvailable
            ? `
              customer:JSON
              company:JSON
              branch:JSON
              teamMember:JSON
              department:JSON
              `
            : ``
        }
    }

    type MovementItem{
        _id:String,
        assetName:String,
        assetId:String,
        assetDetail:Asset
        sourceLocations:ItemSourceLocation,
        branchId:String,
        departmentId:String,
        customerId:String,
        movementId:String,
        teamMemberId:String,
        companyId:String,
        createdAt:Date

        ${
          contactsAvailable
            ? `
            customer:JSON
            company:JSON
            branch:JSON
            teamMember:JSON
            department:JSON
            `
            : ``
        }
    }

    type Movement {
        _id:String
        createdAt:Date
        modifiedAt:Date
        userId:String
        movedAt:Date
        itemIds:[String]
        description:String
        
        ${contactsAvailable ? `user:JSON` : ``}
        
        items:[MovementItem]
    }

    input IMovementItem {
        assetId:String,
        assetName:String,
        branchId:String,
        departmentId:String,
        companyId:String,
        customerId:String,
        teamMemberId:String
    }
`;
export const mutations = `
    assetMovementAdd(movedAt:String,description:String,items:[IMovementItem]):String
    assetMovementUpdate(_id: String,doc:JSON):String
    assetMovementRemove(ids:[String]):String
`;
export const queries = `
    assetMovements(${movementFilters},${commonFilterParams}):[Movement]
    assetMovementTotalCount(${movementFilters},${commonFilterParams}):Int
    assetMovement(_id:String):Movement
    assetMovementItems(${movementFilters},${commonFilterParams}):[MovementItem]
    assetMovementItemsTotalCount(${movementFilters}):Int
    assetMovementItem(assetId:String):MovementItem
    currentAssetMovementItems(assetIds:[String]):[MovementItem]
`;
