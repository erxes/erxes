export const createdAtModifier = schema => {
  schema.add({
    createdAt: Date,
  });

  schema.pre('save', function(next) {
    if (this._id == undefined) {
      this.createdAt = new Date();
    }
    next();
  });
};
