const templateParams = `
    $perPage: Int, 
    $page: Int, 
    $categoryIds: [String], 
    $searchValue: String,
    $contentType: String
`;

const templateVariables = `
    perPage: $perPage, 
    page: $page, 
    categoryIds: $categoryIds, 
    searchValue: $searchValue,
    contentType: $contentType
`;

const templateList = `
    query templateList(${templateParams}) {
        templateList(${templateVariables}) {
            list {
              _id
              name
              description
              content
              contentType
              categories {
                _id
                name
                contentType
              }
            }
            totalCount
        }
    }
`;

const categoryList = `
    query categoryList($type: String) {
        categoryList(type: $type) {
            list {
                _id
                name
                parentId
                order
                code
                contentType
                templateCount
                isRoot
            }
            totalCount
        }
    }
`;

// const templatePreview = `
//     query templatePreview($serviceName: String!, $contentType: String!, $contentId: String!) {
//         templatePreview(serviceName: $serviceName, contentType: $contentType, contentId: $contentId)
//     }
// `;

export default {
    templateList,
    // templatePreview,
    categoryList
}