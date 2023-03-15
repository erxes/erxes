const commonParams = `
    $searchValue: String
    $tagIds:[String]
    $perPage: Int
    $page: Int
`;

const commonParamsDef = `
    searchValue: $searchValue
    perPage: $perPage
    page: $page
    tagIds:$tagIds
`;

const list = `
    query RiskIndicatorsGroups (${commonParams}) {
        riskIndicatorsGroups(${commonParamsDef}) {
            _id,
            name,
            description,
            tagIds
            calculateMethod,
            calculateLogics {
                _id
                name
                value
                logic
                color
            }
            groups {
                _id
                name
                calculateMethod
                percentWeight
                indicatorIds
                calculateLogics {
                    _id
                    name
                    value
                    logic
                    color
                }
            }
            createdAt
            modifiedAt
        },
        riskIndicatorsGroupsTotalCount(${commonParamsDef})
    }
`;

export default { list };
