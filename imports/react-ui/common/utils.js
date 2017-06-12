export const toggleBulk = (bulk, object, toAdd) => {
  let entries = bulk.get();

  // remove old entry
  entries = _.without(entries, _.findWhere(entries, { _id: object._id }));

  if (toAdd) {
    entries.push(object);
  }

  bulk.set(entries);
};
