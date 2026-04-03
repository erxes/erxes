import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type TicketActivityMetadata {
        newValue: String
        previousValue: String
    }

    type TicketActivity {
        _id: String
        action: String
        contentId: String
        module: String
        metadata:TicketActivityMetadata
        createdBy: String

        createdAt: Date
        updatedAt: Date
    }

    type TicketActivityListResponse {
        list: [TicketActivity],
        pageInfo: PageInfo
        totalCount: Int,
    }

    type TicketActivitySubscription {
        type: String
        activity: TicketActivity
    }
`;

const activityFilterParams = `
    contentId: String!
    ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
   getTicketActivities(${activityFilterParams}): TicketActivityListResponse
`;
