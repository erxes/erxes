const logQueries = {
  logs(_root, models, args: { type: string; typeIds: string }) {
    return models.Logs.find(args).sort({ createdAt: -1 });
  }
};

export default logQueries;
