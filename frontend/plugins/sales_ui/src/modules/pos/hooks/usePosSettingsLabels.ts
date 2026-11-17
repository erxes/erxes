import { useTranslation } from 'react-i18next';

const labels = {
  en: {
    initialCategoriesDescription:
      'Categories shown first when the POS screen opens.',
    productGroupsDescription:
      'Choose which products are sold at this POS. Leave everything empty to sell all products.',
    include: 'Include',
    exclude: 'Exclude',
    kioskDescription:
      'Hide these categories and products from the kiosk screen only.',
    remainderDescription:
      'Control how stock balances are shown and checked during sales.',
    showRemainder: 'Show remainder',
    showRemainderDescription:
      'Display the available quantity on product cards.',
    checkRemainderDescription:
      'Prevent selling more than the available quantity.',
    saveRemainderDescription:
      'Keep a copy of the remainder on the POS for faster checks.',
    checkExcludeDescription:
      'Products in these categories are sold without a remainder check.',
    banFractions: 'Ban fractions',
    banFractionsDescription: 'Allow only whole quantities in the cart.',
    serviceChargeDescription:
      'Adds a percentage of the order total as a separate line using the selected product.',
    adminsDescription:
      'Admins manage the POS and can use every cashier feature.',
    cashiersDescription: 'Cashiers take orders and payments at the till.',
    members: 'Team members',
    printTempBill: 'Print temporary bill',
    printTempBillDescription: 'Print a pre-bill before the order is paid.',
    seeReport: 'See reports',
    seeReportDescription: 'Open sales reports from the POS.',
    createCustomer: 'Create customers',
    createCustomerDescription: 'Add new customers while taking an order.',
    directDiscount: 'Direct discount',
    directDiscountDescription:
      'Enter a discount on the order without a voucher or rule.',
    directDiscountLimit: 'Discount limit',
    directDiscountLimitDescription:
      'Highest discount allowed, as a percent or an amount.',
    paymentMethodsTitle: 'Payment methods',
    paymentMethodsDescription:
      'Online payments and other payment types the till accepts.',
    loyaltyTitle: 'Loyalty',
    loyaltyDescription: 'Reward customers for their purchases.',
    couponsTitle: 'Coupons',
    deliveryStageTitle: 'Deal stage',
    deliveryStageDescription:
      'Delivery orders become deals in this stage once they are done.',
    pipeline: 'Pipeline',
    stage: 'Stage',
    mapField: 'Location field',
    mapFieldDescription: 'Deal property that stores the delivery location.',
    deliveryUsersDescription:
      'People who follow each delivery deal, and the product that carries the delivery fee.',
    watchedUsers: 'Watched users',
    assignedUsers: 'Assigned users',
    deliveryProduct: 'Delivery product',
    logosDescription: 'Images shown on the POS, kiosk and browser tab.',
    colorsDescription: 'Brand colors used across the POS screens.',
    primary: 'Primary',
    secondary: 'Secondary',
    third: 'Third',
    infosDescription: 'Contact details printed on receipts and screens.',
    website: 'Website',
    phone: 'Phone',
    kitchenScreenDescription:
      'Show incoming orders on a screen in the kitchen.',
    showTypes: 'Orders to show',
    statusChange: 'Mark as done',
    timeMinute: 'Time (minutes)',
    waitingScreenDescription:
      'Show customers which orders are being prepared and ready.',
    changeType: 'Refresh by',
    changeTime: 'Refresh time (minutes)',
    changeCount: 'Orders per page',
    contentUrl: 'Content URL',
    printDescription: 'Print order slips automatically.',
    kitchenPrint: 'Kitchen print',
    kitchenPrintDescription: 'Print each new order for the kitchen.',
    waitingPrint: 'Waiting print',
    waitingPrintDescription: 'Print a queue number for the customer.',
    syncCardsDescription:
      'Create deals or tasks from POS orders on the boards you choose.',
    customerFormDescription:
      'Fields cashiers fill in when they add a customer at the till.',
  },
  mn: {
    initialCategoriesDescription:
      'POS дэлгэц нээгдэхэд эхэлж харагдах ангилалууд.',
    productGroupsDescription:
      'Энэ POS дээр зарагдах бүтээгдэхүүнийг сонгоно. Хоосон үлдээвэл бүх бүтээгдэхүүн зарагдана.',
    include: 'Оруулах',
    exclude: 'Хасах',
    kioskDescription:
      'Эдгээр ангилал, бүтээгдэхүүнийг зөвхөн киоск дэлгэц дээр нуана.',
    remainderDescription:
      'Борлуулалтын үед үлдэгдлийг харуулах, шалгах тохиргоо.',
    showRemainder: 'Үлдэгдэл харуулах',
    showRemainderDescription:
      'Бүтээгдэхүүний карт дээр боломжит тоо ширхэгийг харуулна.',
    checkRemainderDescription: 'Боломжит үлдэгдлээс илүү зарахыг хориглоно.',
    saveRemainderDescription:
      'Шалгалтыг хурдасгахын тулд үлдэгдлийг POS дээр хадгална.',
    checkExcludeDescription:
      'Эдгээр ангиллын бүтээгдэхүүнийг үлдэгдэл шалгалгүйгээр зарна.',
    banFractions: 'Бутархайг хориглох',
    banFractionsDescription: 'Сагсанд зөвхөн бүхэл тоо ширхэг оруулна.',
    serviceChargeDescription:
      'Захиалгын дүнгийн хувиар тооцож, сонгосон бүтээгдэхүүнээр тусад нь нэмнэ.',
    adminsDescription:
      'Админ POS-ийг удирдах ба кассчны бүх боломжийг ашиглана.',
    cashiersDescription: 'Кассчин касс дээр захиалга, төлбөр авна.',
    members: 'Ажилтнууд',
    printTempBill: 'Түр баримт хэвлэх',
    printTempBillDescription:
      'Төлбөр төлөгдөхөөс өмнө урьдчилсан баримт хэвлэнэ.',
    seeReport: 'Тайлан харах',
    seeReportDescription: 'POS дээрээс борлуулалтын тайлан нээнэ.',
    createCustomer: 'Харилцагч үүсгэх',
    createCustomerDescription: 'Захиалга авах үедээ шинэ харилцагч нэмнэ.',
    directDiscount: 'Шууд хөнгөлөлт',
    directDiscountDescription:
      'Ваучер, дүрэмгүйгээр захиалгад хөнгөлөлт оруулна.',
    directDiscountLimit: 'Хөнгөлөлтийн хязгаар',
    directDiscountLimitDescription:
      'Олгож болох дээд хөнгөлөлт, хувь эсвэл дүнгээр.',
    paymentMethodsTitle: 'Төлбөрийн хэрэгсэл',
    paymentMethodsDescription:
      'Касс дээр хүлээн авах онлайн болон бусад төлбөрийн төрлүүд.',
    loyaltyTitle: 'Урамшуулал',
    loyaltyDescription: 'Худалдан авалтад нь харилцагчийг урамшуулна.',
    couponsTitle: 'Coupon',
    deliveryStageTitle: 'Хэлцлийн үе шат',
    deliveryStageDescription:
      'Хүргэлттэй захиалга дуусахад энэ үе шатанд хэлцэл болж орно.',
    pipeline: 'Дамжлага',
    stage: 'Үе шат',
    mapField: 'Байршлын талбар',
    mapFieldDescription: 'Хүргэлтийн байршлыг хадгалах хэлцлийн талбар.',
    deliveryUsersDescription:
      'Хүргэлтийн хэлцлийг хариуцах, хянах хүмүүс болон хүргэлтийн төлбөрийн бүтээгдэхүүн.',
    watchedUsers: 'Хянагч хэрэглэгчид',
    assignedUsers: 'Хариуцагч хэрэглэгчид',
    deliveryProduct: 'Хүргэлтийн бүтээгдэхүүн',
    logosDescription: 'POS, киоск болон хөтчийн таб дээр харагдах зургууд.',
    colorsDescription: 'POS дэлгэцүүдэд ашиглагдах брэнд өнгөнүүд.',
    primary: 'Үндсэн',
    secondary: 'Хоёрдогч',
    third: 'Гуравдагч',
    infosDescription: 'Баримт, дэлгэц дээр гарах холбоо барих мэдээлэл.',
    website: 'Вэб сайт',
    phone: 'Утас',
    kitchenScreenDescription:
      'Ирж буй захиалгуудыг гал тогооны дэлгэц дээр харуулна.',
    showTypes: 'Харуулах захиалга',
    statusChange: 'Дууссан болгох',
    timeMinute: 'Хугацаа (мин)',
    waitingScreenDescription:
      'Бэлтгэгдэж буй болон бэлэн захиалгуудыг харилцагчид харуулна.',
    changeType: 'Шинэчлэх арга',
    changeTime: 'Шинэчлэх хугацаа (мин)',
    changeCount: 'Нэг хуудсанд харуулах тоо',
    contentUrl: 'Агуулгын URL',
    printDescription: 'Захиалгын хуудсыг автоматаар хэвлэнэ.',
    kitchenPrint: 'Гал тогоонд хэвлэх',
    kitchenPrintDescription: 'Шинэ захиалга бүрийг гал тогоонд хэвлэнэ.',
    waitingPrint: 'Дугаар хэвлэх',
    waitingPrintDescription: 'Харилцагчид дарааллын дугаар хэвлэж өгнө.',
    syncCardsDescription:
      'POS захиалгаас сонгосон самбар дээр хэлцэл, даалгавар үүсгэнэ.',
    customerFormDescription:
      'Кассчин касс дээр харилцагч нэмэхэд бөглөх талбарууд.',
  },
};

export const usePosSettingsLabels = (): typeof labels.en => {
  const { i18n } = useTranslation('sales');
  return (i18n.resolvedLanguage || i18n.language).startsWith('mn')
    ? labels.mn
    : labels.en;
};
