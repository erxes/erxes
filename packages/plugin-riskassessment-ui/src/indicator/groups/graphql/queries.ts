import { isEnabled } from '@erxes/ui/src/utils/core';

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

const list = `
    query RiskIndicatorsGroups (${commonParams}) {
        riskIndicatorsGroups(${commonParamsDef}) {
            _id,
            name,
            description,
            tagIds
            ${isEnabled('tags') ? `tags{_id,name,colorCode}` : ''}
            ignoreZeros
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

export default { list, detail };
