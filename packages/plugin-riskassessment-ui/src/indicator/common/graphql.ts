const calculateLogicsFields = `
        _id
        color
        logic
        name
        value
        value2
`;

const categoryFields = `
        _id
        formId
        name
        parentId
`;

const customScoreFields = `
        label
        percentWeight
`;

const formFields = `
    _id
        calculateLogics {
            ${calculateLogicsFields}
        }
        calculateMethod
        formId
        percentWeight
`;

export const riskIndicatorFields = ({
  calculateLogics = true,
  categories = true,
  customScoreField = true,
  forms = true
}: {
  calculateLogics?: boolean;
  categories?: boolean;
  customScoreField?: boolean;
  forms?: boolean;
}) => `
      _id
      branchIds
      ${calculateLogics ? ` calculateLogics {${calculateLogicsFields}}` : ''}
      calculateMethod
      ${categories ? ` categories {${categoryFields}} ` : ''}
      categoryId
      createdAt
      departmentIds
      description
      name
      operationIds
      ${customScoreField ? `customScoreField {${customScoreFields}}` : ''}
      ${forms ? `forms { ${formFields} }` : ''}
`;
