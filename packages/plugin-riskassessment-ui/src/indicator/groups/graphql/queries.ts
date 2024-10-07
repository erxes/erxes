const commonParams = `
    $ids:[String]
    $searchValue: String
    $tagIds:[String]
    $perPage: Int
    $page: Int
`;

const commonParamsDef = `
    ids:$ids
    searchValue: $searchValue
    perPage: $perPage
    page: $page
    tagIds:$tagIds
`;

const CALCULATE_LOGIC_FIELDS = `
     _id
    name
    value
    logic
    color

`;
const COMMON_GROUP_FIELDS = `
    _id,
    name,
    description,
    tagIds
    tags{_id,name,colorCode}
    ignoreZeros
    calculateMethod,
`;

const list = `
    query RiskIndicatorsGroups (${commonParams}) {
        riskIndicatorsGroups(${commonParamsDef}) {
            ${COMMON_GROUP_FIELDS}
            calculateLogics {
                ${CALCULATE_LOGIC_FIELDS}
            }
            groups {
                _id
                name
                calculateMethod
                percentWeight
                indicatorIds
                calculateLogics { ${CALCULATE_LOGIC_FIELDS} }
            }
            createdAt
            modifiedAt
        },
        riskIndicatorsGroupsTotalCount(${commonParamsDef})
    }
`;

const getFullDetail = `
    query RiskIndicatorsGroup ($_id:String) {
        riskIndicatorsGroup(_id:$_id){
            ${COMMON_GROUP_FIELDS}
            calculateLogics {
                 ${CALCULATE_LOGIC_FIELDS}
            }
            groups {
                _id
                name
                calculateMethod
                percentWeight
                indicatorIds
                calculateLogics {
                    ${CALCULATE_LOGIC_FIELDS}
                }
            }
            createdAt
            modifiedAt
        }

    }
`;

const detail = `
    query RiskIndicatorsGroup ($_id:String) {
        riskIndicatorsGroup(_id:$_id){
            _id,
            name,
            tagIds
            groups {
                _id
                name
            }
        }

    }
`;

export default { list, detail, getFullDetail };
