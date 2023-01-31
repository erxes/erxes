const commonParams = `
    $searchValue: String
    $perPage: Int
    $page: Int
`;

const commonParamsDef = `
    searchValue: $searchValue
    perPage: $perPage
    page: $page
`;

const list = `
    query RiskIndicatorsGroups (${commonParams}) {
        riskIndicatorsGroups(${commonParamsDef}) {
            _id,
            name,
            description,
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
