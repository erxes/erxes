export const changeDeal = (postData: any) => {
  if (!postData.destinationStageId && !postData.sourceStageId && !postData.deal) {
    return { config: {} };
  }

  // if (postData.deal.paymentData !== postData.deal.productsData){
  //   return {config: {}}
  // }
  return { destinationStageId: postData.destinationStageId };
};
