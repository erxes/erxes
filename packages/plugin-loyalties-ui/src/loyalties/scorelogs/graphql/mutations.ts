const changeScore = `
    mutation ChangeScore($changeScore: Int, $createdBy: String, $description: String, $ownerId: String, $ownerType: String) {
        changeScore(changeScore: $changeScore, createdBy: $createdBy, description: $description, ownerId: $ownerId, ownerType: $ownerType)
    }
`;

export default {
  changeScore
};
