const commonParamsDef = `
  $name: String,
  $description: String,
  $categoryId: String,
  $features: [ExmFeatureInput],
  $logo: AttachmentInput,
  $appearance: ExmAppearanceInput,
  $url: String
  $favicon: AttachmentInput
  $webName: String
  $webDescription: String
`;

const commonParams = `
  name: $name,
  description: $description,
  categoryId: $categoryId,
  features: $features,
  logo: $logo,
  appearance: $appearance,
  url: $url
  favicon: $favicon
  webName: $webName
  webDescription: $webDescription
`;

const exmsAdd = `
	mutation exmsAdd(${commonParamsDef}) {
		exmsAdd(${commonParams}) {
			_id
		}
	}
`;

const exmsRemove = `
	mutation exmsRemove($_id: String!) {
		exmsRemove(_id: $_id)
	}
`;

const exmsEdit = `
	mutation exmsEdit($_id: String!, ${commonParamsDef} ) {
		exmsEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const addCategory = `
mutation exmCoreCategoryAdd($name: String, $description: String, $parentId: String, $code: String) {
  exmCoreCategoryAdd(name: $name, description: $description, parentId: $parentId, code: $code)
}
`;

const editCategory = `
mutation exmCoreCategoryUpdate($id: String, $name: String, $parentId: String, $description: String, $code: String) {
  exmCoreCategoryUpdate(_id: $id, name: $name, parentId: $parentId, description: $description, code: $code)
}
`;
const removeCategory = `
mutation exmCoreCategoryRemove($id: String) {
  exmCoreCategoryRemove(_id: $id)
}
`;

export default {
  exmsAdd,
  exmsEdit,
  exmsRemove,
  addCategory,
  editCategory,
  removeCategory
};
