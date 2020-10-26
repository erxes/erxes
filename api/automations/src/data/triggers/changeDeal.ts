export const changeDeal = (postData: any) => {
  if (!postData.destinationStageId && !postData.sourceStageId && !postData.deal) {
    return { config: {} };
  }

  return { destinationStageId: postData.destinationStageId };
};
