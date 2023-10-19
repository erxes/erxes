import { __ } from 'coreui/utils';

export const menuContracts = [
  {
    title: __('Contracts'),
    link: '/erxes-plugin-loan/contract-list',
    permission: 'showContracts'
  },
  {
    title: __('Collaterals'),
    link: '/erxes-plugin-loan/collateral-list',
    permission: 'showCollaterals'
  },
  {
    title: __('Transactions'),
    link: '/erxes-plugin-loan/transaction-list',
    permission: 'showTransactions'
  },
  {
    title: __('PeriodLocks'),
    link: '/erxes-plugin-loan/periodLock-list',
    permission: 'showPeriodLocks'
  },
  {
    title: __('Classification History'),
    link: '/erxes-plugin-loan/classificationHistory',
    permission: 'showContracts'
  }
];

export const FILTER_PARAMS_TR = [
  'search',
  'contractId',
  'companyId',
  'customerId',
  'contractHasnt',
  'startDate',
  'payDate',
  'endDate'
];

export const FILTER_PARAMS_CONTRACT = [
  'isExpired',
  'closeDate',
  'repaymentDate',
  'startStartDate',
  'endStartDate',
  'startCloseDate',
  'endCloseDate',
  'contractTypeId',
  'customerId',
  'companyId',
  'leaseAmount',
  'interestRate',
  'tenor',
  'repayment',
  'branchId'
];

export const WEEKENDS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

export const ORGANIZATION_TYPE = {
  BBSB: 'bbsb',
  ENTITY: 'entity'
};

export const LoanPurpose = {
  organization: [
    'Хуулийн этгээдэд олгосон зээл',
    'Хөдөө аж ахуй, ойн аж ахуй, загас барилт, ан агнуур',
    'Уул уурхай, олборлолт',
    'Боловсруулах үйлдвэрлэл',
    'Цахилгаан, хий, уур, агааржуулалтын хангамж',
    'Усан хангамж, бохир ус, хог хаягдлын менежмент болон цэвэрлэх үйл ажиллагаа',
    'Барилга',
    'Бөөний болон жижиглэн худалдаа',
    'Машин мотоциклийн засвар үйлчилгээ',
    'Тээвэр ба агуулахын үйл ажиллагаа',
    'Байр сууц болон хоол хүнсээр үйлчлэх үйл ажиллагаа',
    'Мэдээлэл холбоо',
    'Санхүүгийн болон даатгалын үйл ажиллагаа',
    'Үл хөдлөх хөрөнгийн үйл ажиллагаа',
    'Мэргэжлийн, шинжлэх ухаан болон техникийн үйл ажиллагаа',
    'Захиргааны болон дэмжлэг үзүүлэх үйл ажиллагаа',
    'Төрийн удирдлага ба батлан хамгаалах үйл ажиллагаа, албан журмын нийгмийн хамгаалал',
    'Боловсрол',
    'Хүний эрүүл мэнд, нийгмийн үйл ажиллагаа',
    'Бусад'
  ],
  person: [
    'Хөдөө аж ахуй, ойн аж ахуй, загас барилт, ан агнуур',
    'Уул уурхай, олборлолт',
    'Боловсруулах үйлдвэрлэл',
    'Цахилгаан, хий, уур, агааржуулалтын хангамж',
    'Усан хангамж, бохир ус, хог хаягдлын менежмент болон цэвэрлэх үйл ажиллагаа',
    'Барилга',
    'Бөөний болон жижиглэн худалдаа',
    'Машин мотоциклийн засвар үйлчилгээ',
    'Тээвэр ба агуулахын үйл ажиллагаа',
    'Байр сууц болон хоол хүнсээр үйлчлэх үйл ажиллагаа',
    'Мэдээлэл холбоо',
    'Санхүүгийн болон даатгалын үйл ажиллагаа',
    'Үл хөдлөх хөрөнгийн үйл ажиллагаа',
    'Мэргэжлийн, шинжлэх ухаан болон техникийн үйл ажиллагаа',
    'Захиргааны болон дэмжлэг үзүүлэх үйл ажиллагаа',
    'Төрийн удирдлага ба батлан хамгаалах үйл ажиллагаа, албан журмын нийгмийн хамгаалал',
    'Боловсрол',
    'Хүний эрүүл мэнд, нийгмийн үйл ажиллагаа',
    'Бусад'
  ]
};
