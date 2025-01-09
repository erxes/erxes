const params = `
  $changeScore: Int,
  $createdBy: String,
  $description: String,
  $ownerId: String,
  $ownerType: String
  $campaignId: String
`;

const paramsDef = `
  changeScore: $changeScore,
  createdBy: $createdBy,
  description: $description,
  ownerId: $ownerId,
  ownerType: $ownerType,
  campaignId: $campaignId
`;

const changeScore = `
    mutation ChangeScore(${params}) {
        changeScore(${paramsDef})
    }
`;

export default {
  changeScore
};
