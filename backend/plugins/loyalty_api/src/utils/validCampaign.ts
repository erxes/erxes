export const validCampaign = (doc) => {
  if (!doc.startDate || !doc.endDate || !doc.finishDateOfUse) {
    return;
  }

  if (doc.startDate.getTime() - Date.now() < -24 * 1000 * 60 * 60) {
    throw new Error("The start date must be in the future");
  }

  if (doc.endDate && doc.startDate > doc.endDate) {
    throw new Error("The end date must be after from start date");
  }

  if (doc.finishDateOfUse && doc.endDate > doc.finishDateOfUse) {
    throw new Error("The finish date of use must be after from end date");
  }
};