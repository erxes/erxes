import { getConfig, getLoanContract, toPolaris } from './utils';

const getClassificationCode = (classification: string) => {
  switch (classification) {
    case 'NORMAL':
      return '1';
    case 'EXPIRED':
      return '2';
    case 'DOUBTFUL':
      return '3';
    case 'NEGATIVE':
      return '4';
    case 'BAD':
      return '5';
    default:
      break;
  }
};

export const loanClassificationToPolaris = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const changeClassification = params.updatedDocument || params.object;

  const loanContract = await getLoanContract(
    subdomain,
    changeClassification.contractId,
  );

  let sendData = [
    {
      operCode: '13610283',
      txnAcntCode: loanContract.number,
      newValue: getClassificationCode(changeClassification.newClassification),
      txnDesc: changeClassification.description,
      sourceType: 'OI',
      identityType: '',
    },
  ];

  await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610283',
    role: config.role,
    token: config.token,
    data: sendData,
  });
};
