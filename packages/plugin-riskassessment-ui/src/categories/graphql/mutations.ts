const addAssessmentCategory = `
    mutation AddAssessmentCategory($name: String, $parentId: String,$code: String,$type: String) {
        addAssessmentCategory( name: $name, parentId: $parentId,code: $code,type: $type)
    }
`;

const removeAssessmentCategory = `
    mutation RemoveAssessmentCategory($id: String) {
        removeAssessmentCategory(_id: $id)
    }
`;

const editAssessmentCategory = `
    mutation EditAssessmentCategory($_id:String,$code: String, $name: String, $parentId: String,$type: String) {
        editAssessmentCategory(_id:$_id,code: $code, name: $name, parentId: $parentId,type: $type)
    }
`;

const removeUnsavedRiskAssessmentCategoryForm = `
    mutation RemoveUnsavedRiskAssessmentCategoryForm($formId: String) {
        removeUnsavedRiskAssessmentCategoryForm(formId: $formId)
    }
`;

export default {
  addAssessmentCategory,
  removeAssessmentCategory,
  editAssessmentCategory,
  removeUnsavedRiskAssessmentCategoryForm
};
