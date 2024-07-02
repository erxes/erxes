const templatesGetTypes = `
    query templatesGetTypes {
        templatesGetTypes
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

export default {
    templatesGetTypes,

    // category
    categoryList
}