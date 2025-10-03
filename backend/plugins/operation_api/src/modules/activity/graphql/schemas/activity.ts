import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type OperationActivityMetadata {
        newValue: String
        previousValue: String
    }
    
    type OperationActivity {
        _id: String
        action: String  
        contentId: String
        module: String
        metadata:OperationActivityMetadata
        createdBy: String

        createdAt: Date
        updatedAt: Date
    }

    type OperationActivityListResponse {
        list: [OperationActivity],
        pageInfo: PageInfo
        totalCount: Int,
    }

    type OperationActivitySubscription {
        type: String
        activity: OperationActivity
    }
`;

const activityFilterParams = `
    contentId: String!
    ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
   getOperationActivities(${activityFilterParams}): OperationActivityListResponse
`;
