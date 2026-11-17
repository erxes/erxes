import { useTranslation } from 'react-i18next';

const LABELS = {
  initialCategoriesDescription: [
    'Categories shown first when the POS screen opens.',
    'POS дэлгэц нээгдэхэд эхэлж харагдах ангилалууд.',
  ],
  productGroupsDescription: [
    'Choose which products are sold at this POS. Leave everything empty to sell all products.',
    'Энэ POS дээр зарагдах бүтээгдэхүүнийг сонгоно. Хоосон үлдээвэл бүх бүтээгдэхүүн зарагдана.',
  ],
  include: ['Include', 'Оруулах'],
  exclude: ['Exclude', 'Хасах'],
  kioskDescription: [
    'Hide these categories and products from the kiosk screen only.',
    'Эдгээр ангилал, бүтээгдэхүүнийг зөвхөн киоск дэлгэц дээр нуана.',
  ],
  remainderDescription: [
    'Control how stock balances are shown and checked during sales.',
    'Борлуулалтын үед үлдэгдлийг харуулах, шалгах тохиргоо.',
  ],
  showRemainder: ['Show remainder', 'Үлдэгдэл харуулах'],
  showRemainderDescription: [
    'Display the available quantity on product cards.',
    'Бүтээгдэхүүний карт дээр боломжит тоо ширхэгийг харуулна.',
  ],
  checkRemainderDescription: [
    'Prevent selling more than the available quantity.',
    'Боломжит үлдэгдлээс илүү зарахыг хориглоно.',
  ],
  saveRemainderDescription: [
    'Keep a copy of the remainder on the POS for faster checks.',
    'Шалгалтыг хурдасгахын тулд үлдэгдлийг POS дээр хадгална.',
  ],
  checkExcludeDescription: [
    'Products in these categories are sold without a remainder check.',
    'Эдгээр ангиллын бүтээгдэхүүнийг үлдэгдэл шалгалгүйгээр зарна.',
  ],
  banFractions: ['Ban fractions', 'Бутархайг хориглох'],
  banFractionsDescription: [
    'Allow only whole quantities in the cart.',
    'Сагсанд зөвхөн бүхэл тоо ширхэг оруулна.',
  ],
  serviceChargeDescription: [
    'Adds a percentage of the order total as a separate line using the selected product.',
    'Захиалгын дүнгийн хувиар тооцож, сонгосон бүтээгдэхүүнээр тусад нь нэмнэ.',
  ],
  adminsDescription: [
    'Admins manage the POS and can use every cashier feature.',
    'Админ POS-ийг удирдах ба кассчны бүх боломжийг ашиглана.',
  ],
  cashiersDescription: [
    'Cashiers take orders and payments at the till.',
    'Кассчин касс дээр захиалга, төлбөр авна.',
  ],
  members: ['Team members', 'Ажилтнууд'],
  printTempBill: ['Print temporary bill', 'Түр баримт хэвлэх'],
  printTempBillDescription: [
    'Print a pre-bill before the order is paid.',
    'Төлбөр төлөгдөхөөс өмнө урьдчилсан баримт хэвлэнэ.',
  ],
  seeReport: ['See reports', 'Тайлан харах'],
  seeReportDescription: [
    'Open sales reports from the POS.',
    'POS дээрээс борлуулалтын тайлан нээнэ.',
  ],
  createCustomer: ['Create customers', 'Харилцагч үүсгэх'],
  createCustomerDescription: [
    'Add new customers while taking an order.',
    'Захиалга авах үедээ шинэ харилцагч нэмнэ.',
  ],
  directDiscount: ['Direct discount', 'Шууд хөнгөлөлт'],
  directDiscountDescription: [
    'Enter a discount on the order without a voucher or rule.',
    'Ваучер, дүрэмгүйгээр захиалгад хөнгөлөлт оруулна.',
  ],
  directDiscountLimit: ['Discount limit', 'Хөнгөлөлтийн хязгаар'],
  directDiscountLimitDescription: [
    'Highest discount allowed, as a percent or an amount.',
    'Олгож болох дээд хөнгөлөлт, хувь эсвэл дүнгээр.',
  ],
  paymentMethodsTitle: ['Payment methods', 'Төлбөрийн хэрэгсэл'],
  paymentMethodsDescription: [
    'Online payments and other payment types the till accepts.',
    'Касс дээр хүлээн авах онлайн болон бусад төлбөрийн төрлүүд.',
  ],
  loyaltyTitle: ['Loyalty', 'Урамшуулал'],
  loyaltyDescription: [
    'Reward customers for their purchases.',
    'Худалдан авалтад нь харилцагчийг урамшуулна.',
  ],
  couponsTitle: ['Coupons', 'Coupon'],
  deliveryStageTitle: ['Deal stage', 'Хэлцлийн үе шат'],
  deliveryStageDescription: [
    'Delivery orders become deals in this stage once they are done.',
    'Хүргэлттэй захиалга дуусахад энэ үе шатанд хэлцэл болж орно.',
  ],
  pipeline: ['Pipeline', 'Дамжлага'],
  stage: ['Stage', 'Үе шат'],
  mapField: ['Location field', 'Байршлын талбар'],
  mapFieldDescription: [
    'Deal property that stores the delivery location.',
    'Хүргэлтийн байршлыг хадгалах хэлцлийн талбар.',
  ],
  deliveryUsersDescription: [
    'People who follow each delivery deal, and the product that carries the delivery fee.',
    'Хүргэлтийн хэлцлийг хариуцах, хянах хүмүүс болон хүргэлтийн төлбөрийн бүтээгдэхүүн.',
  ],
  watchedUsers: ['Watched users', 'Хянагч хэрэглэгчид'],
  assignedUsers: ['Assigned users', 'Хариуцагч хэрэглэгчид'],
  deliveryProduct: ['Delivery product', 'Хүргэлтийн бүтээгдэхүүн'],
  logosDescription: [
    'Images shown on the POS, kiosk and browser tab.',
    'POS, киоск болон хөтчийн таб дээр харагдах зургууд.',
  ],
  colorsDescription: [
    'Brand colors used across the POS screens.',
    'POS дэлгэцүүдэд ашиглагдах брэнд өнгөнүүд.',
  ],
  primary: ['Primary', 'Үндсэн'],
  secondary: ['Secondary', 'Хоёрдогч'],
  third: ['Third', 'Гуравдагч'],
  infosDescription: [
    'Contact details printed on receipts and screens.',
    'Баримт, дэлгэц дээр гарах холбоо барих мэдээлэл.',
  ],
  website: ['Website', 'Вэб сайт'],
  phone: ['Phone', 'Утас'],
  kitchenScreenDescription: [
    'Show incoming orders on a screen in the kitchen.',
    'Ирж буй захиалгуудыг гал тогооны дэлгэц дээр харуулна.',
  ],
  showTypes: ['Orders to show', 'Харуулах захиалга'],
  statusChange: ['Mark as done', 'Дууссан болгох'],
  timeMinute: ['Time (minutes)', 'Хугацаа (мин)'],
  waitingScreenDescription: [
    'Show customers which orders are being prepared and ready.',
    'Бэлтгэгдэж буй болон бэлэн захиалгуудыг харилцагчид харуулна.',
  ],
  changeType: ['Refresh by', 'Шинэчлэх арга'],
  changeTime: ['Refresh time (minutes)', 'Шинэчлэх хугацаа (мин)'],
  changeCount: ['Orders per page', 'Нэг хуудсанд харуулах тоо'],
  contentUrl: ['Content URL', 'Агуулгын URL'],
  printDescription: [
    'Print order slips automatically.',
    'Захиалгын хуудсыг автоматаар хэвлэнэ.',
  ],
  kitchenPrint: ['Kitchen print', 'Гал тогоонд хэвлэх'],
  kitchenPrintDescription: [
    'Print each new order for the kitchen.',
    'Шинэ захиалга бүрийг гал тогоонд хэвлэнэ.',
  ],
  waitingPrint: ['Waiting print', 'Дугаар хэвлэх'],
  waitingPrintDescription: [
    'Print a queue number for the customer.',
    'Харилцагчид дарааллын дугаар хэвлэж өгнө.',
  ],
  syncCardsDescription: [
    'Create deals or tasks from POS orders on the boards you choose.',
    'POS захиалгаас сонгосон самбар дээр хэлцэл, даалгавар үүсгэнэ.',
  ],
  customerFormDescription: [
    'Fields cashiers fill in when they add a customer at the till.',
    'Кассчин касс дээр харилцагч нэмэхэд бөглөх талбарууд.',
  ],
} satisfies Record<string, [string, string]>;

type TPosSettingsLabels = Record<keyof typeof LABELS, string>;

const toLanguage = (index: 0 | 1) =>
  Object.fromEntries(
    Object.entries(LABELS).map(([key, values]) => [key, values[index]]),
  ) as TPosSettingsLabels;

const EN_LABELS = toLanguage(0);
const MN_LABELS = toLanguage(1);

export const usePosSettingsLabels = (): TPosSettingsLabels => {
  const { i18n } = useTranslation('sales');
  return (i18n.resolvedLanguage || i18n.language).startsWith('mn')
    ? MN_LABELS
    : EN_LABELS;
};
