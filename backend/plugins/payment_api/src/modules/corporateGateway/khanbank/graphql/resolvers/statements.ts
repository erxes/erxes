const KhanbankStatement = {
  async transactions(statement: any, _params, {}) {
    const tmpTransactions = statement.transactions || [];
    // const total = statement.total ? statement.total.count : 0;

    return tmpTransactions.reverse();
  }
};

export { KhanbankStatement };
