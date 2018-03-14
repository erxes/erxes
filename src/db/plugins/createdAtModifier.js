export const createdAtModifier = schema => {
  schema.add({
    createdAt: Date,
  });

  schema.pre('save', function(next) {
    if (this.createdAt == undefined) {
      this.createdAt = new Date();
    }

    next();
  });
};
