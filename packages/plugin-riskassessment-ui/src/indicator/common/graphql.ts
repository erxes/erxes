const calculateLogicsFields = `
        _id
        color
        logic
        name
        value
        value2
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
  forms = true
}: {
  calculateLogics?: boolean;
  forms?: boolean;
}) => `
      _id
      branchIds
      ${calculateLogics ? ` calculateLogics {${calculateLogicsFields}}` : ''}
      calculateMethod
      createdAt
      departmentIds
      description
      name
      operationIds
      ${forms ? `forms { ${formFields} }` : ''}
`;
