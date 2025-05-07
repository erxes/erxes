const mutationParams = `
    $title: String,
    $description: String,
    $add: JSON,
    $subtract: JSON,
    $createdAt: Date,
    $createdUserId: String,
    $status: String
    $ownerType: String
    $fieldGroupId:String
    $fieldName: String
    $fieldId: String
    $serviceName:String,
    $additionalConfig:JSON

    $restrictions: JSON
    $onlyClientPortal: Boolean
`;
const mutationParamsDef = `
    title: $title,
    description: $description,
    add: $add,
    subtract: $subtract,
    createdAt: $createdAt,
    createdUserId: $createdUserId,
    status: $status
    ownerType: $ownerType
    fieldGroupId: $fieldGroupId
    fieldName: $fieldName
    fieldId: $fieldId
    serviceName:$serviceName
    additionalConfig:$additionalConfig

    restrictions: $restrictions
    onlyClientPortal: $onlyClientPortal
`;

const add = `
    mutation ScoreCampaignAdd(${mutationParams}) {
      scoreCampaignAdd(${mutationParamsDef})
    }
`;

const update = `
    mutation ScoreCampaignUpdate($_id:String,${mutationParams}) {
      scoreCampaignUpdate(_id:$_id,${mutationParamsDef}) 
    }
`;

const remove = `
    mutation ScoreCampaignRemove($_id:String) {
      scoreCampaignRemove(_id:$_id)
    }
`;

const removeCampaigns = `
    mutation ScoreCampaignsRemove($_ids:[String]) {
      scoreCampaignsRemove(_ids:$_ids)
    }
`;

export default {
  add,
  update,
  remove,
  removeCampaigns,
};
