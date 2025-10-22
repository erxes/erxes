const params = `
  $changeScore: Int,
  $createdBy: String,
  $description: String,
  $ownerId: String,
  $ownerType: String
  $campaignId: String,
  $targetId: String
  $serviceName: String
`;

const paramsDef = `
  changeScore: $changeScore,
  createdBy: $createdBy,
  description: $description,
  ownerId: $ownerId,
  ownerType: $ownerType,
  campaignId: $campaignId,
  targetId: $targetId,
  serviceName: $serviceName
`;

const changeScore = `
    mutation ChangeScore(${params}) {
        changeScore(${paramsDef})
    }
`;

export default {
  changeScore
};
