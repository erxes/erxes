import { GQL_CURSOR_PARAM_DEFS } from "erxes-api-shared/utils";

export const commonParams = `
    ids: [String]
    excludeIds: Boolean
    searchValue: String,
    status: String,
    onlyFirstLevel: Boolean,
    parentId: String

    sortField: String

    ${GQL_CURSOR_PARAM_DEFS}
`;
