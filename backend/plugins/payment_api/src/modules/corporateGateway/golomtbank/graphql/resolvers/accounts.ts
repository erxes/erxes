const GolomtBankAccount = {
  async type(account: any, _params) {
    switch (account.type) {
      case 'L':
        return 'Зээл';
      case 'D':
        return 'Дебит';

      default:
        break;
    }
  },
};

export { GolomtBankAccount };
