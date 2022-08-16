const addAssessmentCategory = `
    mutation AddAssessmentCategory($formId: String, $name: String, $parentId: String,$code: String) {
        addAssessmentCategory( formId: $formId, name: $name, parentId: $parentId,code: $code)
    }
`;

const removeAssessmentCategory = `
    mutation RemoveAssessmentCategory($id: String) {
        removeAssessmentCategory(_id: $id)
      }
`;

export default { addAssessmentCategory, removeAssessmentCategory };
