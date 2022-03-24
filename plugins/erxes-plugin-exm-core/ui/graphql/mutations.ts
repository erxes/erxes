const commonParamsDef = `
  $name: String,
  $description: String,
  $features: [ExmFeatureInput],
  $logo: AttachmentInput,
  $appearance: ExmAppearanceInput,
  $welcomeContent: [ExmWelcomeContentInput],
  $scoringConfig: [ExmScoringConfigInput]
`;

const commonParams = `
  name: $name,
  description: $description,
  features: $features,
  logo: $logo,
  appearance: $appearance,
  welcomeContent: $welcomeContent,
  scoringConfig: $scoringConfig
`;

const exmsAdd = `
	mutation exmsAdd(${commonParamsDef}) {
		exmsAdd(${commonParams}) {
			_id
		}
	}
`;

const exmsEdit = `
	mutation exmsEdit($_id: String!, ${commonParamsDef} ) {
		exmsEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

export default {
  exmsAdd,
  exmsEdit
};
