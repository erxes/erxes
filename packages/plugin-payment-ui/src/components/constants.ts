import MonpayForm from './form/MonpayForm';
import PaypalForm from './form/PaypalForm';
import PocketForm from './form/PocketForm';
import QpayForm from './form/QpayForm';
import QuickQrForm from './form/QuickQrForm';
import SocialPayForm from './form/SocialPayForm';
import StorepayForm from './form/StorePayForm';

export const PAYMENTCONFIGS = [
  {
    name: 'QPay',
    description:
      'When you already have a QPay account, you can use this payment method to receive payments in Mongolia.',
    isAvailable: true,
    kind: 'qpay',
    logo: 'images/payments/qpay.png',
    createModal: QpayForm,
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method',
    color: 'blue',
    link:
      'mailto:%20info@qpay.mn?subject=QPay%20Registration&body=Dear%20QPay%20Team,%0D%0A%0D%0AI%20would%20like%20to%20'
  },
  {
    name: 'QPay Quick QR',
    description:
      "If you don't have a QPay account, you can directly register for QPay here and receive payments in Mongolia using this payment method.",
    isAvailable: true,
    kind: 'qpayQuickqr',
    logo: 'images/payments/qpay.png',
    createModal: QuickQrForm,
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method',
    color: 'blue',
    modalSize: 'xl'
  },
  {
    name: 'SocialPay',
    description:
      'Fast and easy way to receive money using the recipient’s mobile number.',
    isAvailable: true,
    kind: 'socialpay',
    logo: 'images/payments/socialpay.png',
    createModal: SocialPayForm,
    createUrl: '/settings/payments/createSocialPay',
    category: 'Payment method',
    color: 'blue',
    link: 'https://www.golomtbank.com/retail/digital-bank/socialpay'
  },
  {
    name: 'MonPay',
    description: 'Easy, fast and reliable payment by QR scan',
    isAvailable: true,
    kind: 'monpay',
    logo: 'images/payments/monpay.png',
    createModal: MonpayForm,
    createUrl: '/settings/payments/createMonPay',
    category: 'Payment method',
    color: 'blue',
    link:
      'mailto:%20Merchantservice@mobifinance.mn?subject=MonPay%20Merchant%20Registration&body=Dear%20MonPay%20Team,%0D%0A%0D%0AI%20would%20like%20to%20'
  },
  {
    name: 'Storepay',
    description:
      'Storepay is a service with no additional interest or fees, where you pay in installments for the goods and services you purchase.',
    isAvailable: true,
    kind: 'storepay',
    logo: 'images/payments/storepay.png',
    createModal: StorepayForm,
    createUrl: '/settings/payments/createStorePay',
    category: 'Payment method',
    color: 'blue'
  },
  {
    name: 'pocket',
    description:
      'Pocket is an online payment tool that enables all types of payments, transfers and transactions. A feature of easy and quick identification of transactions between users of the Pocket application and payment calculations by reading the Pocket QR code without any commission.',
    isAvailable: true,
    kind: 'pocket',
    logo: 'images/payments/pocket.png',
    createModal: PocketForm,
    createUrl: '/settings/payments/createPocket',
    category: 'Payment method',
    color: 'red'
  },
  {
    name: 'Golomt E-Commerce',
    description:
      'Becoming an E-Commerce merchant for online sales and payment we offer products and services 24/7. Accepts most type of domestic and foreign card and provide opportunity to make and receive payment from anywhere',
    isAvailable: false,
    kind: 'golomt',
    logo: 'images/payments/golomt.png',
    createModal: '',
    createUrl: '/settings/payments/createGolomt',
    category: 'Payment method',
    color: 'blue',
    link: 'https://www.golomtbank.com/en/cards/8172'
  },
  {
    name: 'Qpay Wechat Pay',
    description: 'Receive payments in Mongolia through the WeChat Pay',
    isAvailable: false,
    kind: 'wechatpay',
    logo: 'images/payments/wechatpay.png',
    createModal: '',
    createUrl: '/settings/payments/createWechatpay',
    category: 'Payment method',
    color: 'green'
  },
  {
    name: 'Paypal',
    description: 'Paypal payment method',
    isAvailable: false,
    kind: 'paypal',
    logo: 'images/payments/paypal.png',
    createModal: PaypalForm,
    createUrl: '/settings/payments/createPaypal',
    category: 'Payment method',
    color: 'blue'
  }
];

export const PAYMENT_KINDS = {
  QPAY: 'qpay',
  QPAY_QUICK_QR: 'qpayQuickqr',
  SOCIALPAY: 'socialpay',
  GOLOMT: 'golomt',
  MONPAY: 'monpay',
  STOREPAY: 'storepay',
  POCKET: 'pocket',
  WECHATPAY: 'wechatpay',
  PAYPAL: 'paypal',

  ALL: [
    'qpay',
    'socialpay',
    'golomt',
    'monpay',
    'storepay',
    'pocket',
    'wechatpay',
    'paypal',
    'qpayQuickqr'
  ]
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',

  ALL: ['paid', 'pending', 'refunded', 'failed']
};

export const BANK_CODES = [
  { value: '010000', label: 'Bank of Mongolia' },
  { value: '020000', label: 'Capital bank' },
  { value: '040000', label: 'Trade and Development bank' },
  { value: '050000', label: 'KHANBANK' },
  { value: '150000', label: 'Golomt bank' },
  { value: '190000', label: 'Trans bank' },
  { value: '210000', label: 'Arig bank' },
  { value: '220000', label: 'Credit bank' },
  //   { value: '260000', label: 'UB city bank' },
  { value: '290000', label: 'National investment bank' },
  { value: '300000', label: 'Capitron bank' },
  { value: '320000', label: 'Khas bank' },
  { value: '330000', label: 'Chingis Khaan bank' },
  { value: '340000', label: 'State bank' },
  { value: '360000', label: 'Development Bank of Mongolia ' },
  { value: '380000', label: 'Bogd bank' },
  { value: '900000', label: 'MOF (treasury fund) ' },
  { value: '940000', label: 'Security settlement clearing house' },
  { value: '950000', label: 'Central securities depository' },
  { value: '500000', label: 'MobiFinance NBFI' }
];

export const MCC_CODES = [
  {
    value: '0000',
    label: 'Default'
  },
  {
    value: '10000',
    label: 'Other'
  },
  {
    value: '5411',
    label: 'Хүнсний дэлгүүр, супермаркет'
  },
  {
    value: '5499',
    label: 'Bakery'
  },
  {
    value: '5631',
    label: 'Эмэгтэй гоёл, зүүлт'
  },
  {
    value: '5641',
    label: 'Хүүхэд болон нярайн хувцас хэрэглэлийн дэлгүүр'
  },
  {
    value: '5661',
    label: 'Гутлын дэлгүүр'
  },
  {
    value: '5732',
    label: 'Цахилгаан бараа'
  },
  {
    value: '5944',
    label: 'Алт мөнгөн эдлэл, гоёл чимэглэл'
  },
  {
    value: '7994',
    label: 'Интэрнет кафе'
  },
  {
    value: '4812',
    label: 'Гар утас худалдаа'
  },
  {
    value: '5932',
    label: 'Шашны бараа'
  },
  {
    value: '5942',
    label: 'Номын дэлгүүр'
  },
  {
    value: '5021',
    label: 'Оффисын тавилга'
  },
  {
    value: '8062',
    label: 'Эмнэлэг'
  },
  {
    value: '5231',
    label: 'Нүдний шил'
  },
  {
    value: '8211',
    label: 'Сургалтын төв'
  },
  {
    value: '8299',
    label: 'Гадаад хэлний сургалт'
  },
  {
    value: '8351',
    label: 'Хүүхдийн цэцэрлэг'
  },
  {
    value: '4582',
    label: 'Тийз'
  },
  {
    value: '9402',
    label: 'Шуудангийн салбар'
  },
  {
    value: '7534',
    label: 'Авто засварын газар'
  },
  {
    value: '7542',
    label: 'Авто угаалга'
  },
  {
    value: '7011',
    label: 'Зочид буудал'
  },
  {
    value: '5172',
    label: 'Шатахуун түгээх'
  },
  {
    value: '7997',
    label: 'Гольф'
  },
  {
    value: '7941',
    label: 'Фитнесс'
  },
  {
    value: '7832',
    label: 'Кино Театр'
  },
  {
    value: '4722',
    label: 'Аялал жуулчлал'
  },
  {
    value: '4816',
    label: 'Компьютер, гар утас худалдаа'
  },
  {
    value: '5812',
    label: 'Хоолны газар, ресторан'
  },
  {
    value: '5813',
    label: 'Шөнийн цэнгээний газар, паб'
  },
  {
    value: '6012',
    label: 'Ломбард'
  },
  {
    value: '6300',
    label: 'Даатгалын компани'
  },
  {
    value: '6010',
    label: 'Банк бус'
  },
  {
    value: '7216',
    label: 'Хими цэвэрлэгээ'
  },
  {
    value: '5013',
    label: 'Авто сэлбэг'
  },
  {
    value: '5039',
    label: 'Барилгын материал'
  },
  {
    value: '5192',
    label: 'Бичиг хэрэг'
  },
  {
    value: '5193',
    label: 'Гэр ахуйн бараа'
  },
  {
    value: '5921',
    label: 'Шар айраг, вино, архины төрөлжсөн дэлгүүр'
  },
  {
    value: '5399',
    label: 'Бусад бараа бүтээгдэхүүний худалдаа'
  },
  {
    value: '5422',
    label: 'Мах, махан бүтээгдэхүүний нийлүүлэлт'
  },
  {
    value: '5441',
    label: 'Чихэр, самар, амттаны дэлгүүр'
  },
  {
    value: '5451',
    label: 'Сүү, сүүн бүтээгдэхүүний дэлгүүр'
  },
  {
    value: '5311',
    label: 'Их дэлгүүр'
  },
  {
    value: '5331',
    label: 'Төрөлжсөн бус барааны дэлгүүр'
  },
  {
    value: '5309',
    label: 'Татваргүй барааны дэлгүүр'
  },
  {
    value: '5310',
    label: 'Хямдралтай барааны дэлгүүр'
  },
  {
    value: '5300',
    label: 'Бөөний худалдаа'
  },
  {
    value: '5611',
    label: 'Эрэгтэйчүүдийн хувцас, хэрэглэлийн төрөлжсөн дэлгүүр'
  },
  {
    value: '5621',
    label: 'Эмэгтэйчүүдийн хувцасны төрөлжсөн дэлгүүр'
  },
  {
    value: '5651',
    label: 'Гэр бүлийн хувцасны дэлгүүр'
  },
  {
    value: '5655',
    label: 'Спорт хувцасны дэлгүүр'
  },
  {
    value: '5681',
    label: 'Үслэг эдлэлийн дэлгүүр'
  },
  {
    value: '5698',
    label: 'Хиймэл үсний дэлгүүр'
  },
  {
    value: '5699',
    label: 'Бусад эдлэл хэрэглэл, гоѐл чимэглэлийн дэлгүүр'
  },
  {
    value: '5712',
    label: 'Гэрийн тавилга, цахилгаан бараанаас бусад ахуйн барааны дэлгүүр'
  },
  {
    value: '5713',
    label: 'Хивс, хивсэнцэр, шалны дэвсгэрийн дэлгүүр'
  },
  {
    value: '5714',
    label: 'Бөс бараа, хөшиг, бүрээсний дэлгүүр'
  },
  {
    value: '5718',
    label: 'Зуух, зуухны хамгаалалт, жижиг хэрэгслийн дэлгүүр'
  },
  {
    value: '5719',
    label: 'Бусад гэр ахуйн төрөлжсөн барааны дэлгүүр'
  },
  {
    value: '5722',
    label: 'Гэр ахуйн цахилгаан барааны дэлгүүр'
  },
  {
    value: '5733',
    label: 'Хөгжмийн дэлгүүр - хөгжмийн зэмсэг, төгөлдөр хуур, нот'
  },
  {
    value: '5734',
    label: 'Компьютерийн програм хангамжийн дэлгүүр'
  },
  {
    value: '5735',
    label: 'Дуу бичлэг, хуурцаг, CD, DVD-ний дэлгүүр'
  },
  {
    value: '5912',
    label: 'Эм, гоо сайхан, ариун цэврийн барааны дэлгүүр'
  },
  {
    value: '5931',
    label: 'Хуучин барааны дэлгүүр'
  },
  {
    value: '5940',
    label: 'Унадаг дугуйн дэлгүүр'
  },
  {
    value: '5941',
    label: 'Спорт барааны дэлгүүр'
  },
  {
    value: '5943',
    label:
      'Бичиг хэрэг, оффисын хангамж, бичгийн болон хэвлэлийн цаасны дэлгүүр'
  },
  {
    value: '5945',
    label: 'Тоглоомын дэлгүүр'
  },
  {
    value: '5946',
    label: 'Гэрэл зургийн аппарат, холбогдох хэрэгслийн дэлгүүр'
  },
  {
    value: '5947',
    label: 'Бэлэг, мэндчилгээ, бэлэг дурсгалын дэлгүүр'
  },
  {
    value: '5948',
    label: 'Аяллын цүнх, арьсан бүтээгдэхүүний дэлгүүр'
  },
  {
    value: '5949',
    label: 'Бөс бараа, оѐдлын барааны дэлгүүр'
  },
  {
    value: '5950',
    label: 'Шилэн эдлэлийн дэлгүүр'
  },
  {
    value: '5970',
    label: 'Уран зураг, гар урлалын хэрэгслийн дэлгүүр'
  },
  {
    value: '5971',
    label: 'Галарей, уран зургийн худалдаа'
  },
  {
    value: '5972',
    label: 'Тамга, зоосны дэлгүүр'
  },
  {
    value: '5973',
    label: 'Шашны эдлэл хэрэглэлийн дэлгүүр'
  },
  {
    value: '5975',
    label: 'Сонсголын аппарат, дагалдах хэрэгслийн худалдаа'
  },
  {
    value: '5976',
    label: 'Согог заслын бүтээгдэхүүн худалдаа'
  },
  {
    value: '5977',
    label: 'Гоо сайхны барааны дэлгүүр'
  },
  {
    value: '5992',
    label: 'Цэцгийн дэлгүүр'
  },
  {
    value: '5993',
    label: 'Тамхины төрөлжсөн дэлгүүр болон цэг'
  },
  {
    value: '5994',
    label: 'Сонин сэтгүүлийн худалдаа'
  },
  {
    value: '5995',
    label: 'Тэжээвэр амьтан, амьтны хоол, жижиг хэрэгслийн дэлгүүр,'
  },
  {
    value: '5998',
    label: 'Майхан, сүүдрэвчний дэлгүүр'
  },
  {
    value: '5999',
    label: 'Бусад төрөлжсөн барааны дэлгүүр'
  },
  {
    value: '5200',
    label: 'Гэр ахуйн барааны дэлгүүр'
  },
  {
    value: '5211',
    label: 'Модон эдлэл, барилгын материалын дэлгүүр'
  },
  {
    value: '5251',
    label: 'Техник хэрэгслийн дэлгүүр'
  },
  {
    value: '5261',
    label: 'Зүлэгжүүлэлт, цэцэрлэгжүүлэлтийн барааны дэлгүүр'
  },
  {
    value: '5592',
    label: 'Зөөврийн сууцны худалдаа'
  },
  {
    value: '5531',
    label: 'Автомашин болон гэр ахуйн барааны дэлгүүр'
  },
  {
    value: '5532',
    label: 'Автомашины дугуйны дэлгүүр'
  },
  {
    value: '5533',
    label: 'Автомашины сэлбэг, жижиг хэрэгслийн дэлгүүр'
  },
  {
    value: '5561',
    label: 'Мотоциклийн дэлгүүр, худалдаа'
  },
  {
    value: '742',
    label: 'Мал эмнэлгийн үйлчилгээ'
  },
  {
    value: '4119',
    label: 'Түргэн тусламжийн үйлчилгээ'
  },
  {
    value: '8071',
    label: 'Эрүүл мэнд, шүдний лаборатори'
  },
  {
    value: '8099',
    label: 'Эрүүл мэндийн үйлчилгээ'
  },
  {
    value: '8049',
    label: 'Хөлийн эрүүл мэнд, эмчилгээ'
  },
  {
    value: '8050',
    label: 'Асаргаа, сувилгааны газар'
  },
  {
    value: '8011',
    label: 'Эмч'
  },
  {
    value: '8021',
    label: 'Шүдний эмч'
  },
  {
    value: '8041',
    label: 'Бариа засал'
  },
  {
    value: '8043',
    label: 'Нүдний эмч, нүдний шилний газар'
  },
  {
    value: '7911',
    label: 'Бүжгийн танхим, студи, сургууль'
  },
  {
    value: '8220',
    label: 'Их дээд сургууль'
  },
  {
    value: '8241',
    label: 'Эчнээ сургууль'
  },
  {
    value: '8244',
    label: 'Бизнесийн сургууль'
  },
  {
    value: '8249',
    label: 'Мэргэжил олгох сургууль'
  },
  {
    value: '4011',
    label: 'Төмөр замын ачаа тээвэр'
  },
  {
    value: '4112',
    label: 'Төмөр замын зорчигч тээвэр'
  },
  {
    value: '4511',
    label: 'Агаарын ачаа болон зорчигч тээвэр'
  },
  {
    value: '4789',
    label: 'Бусад тээврийн үйлчилгээ'
  },
  {
    value: '780',
    label: 'Орчны тохижилтын үйлчилгээ'
  },
  {
    value: '1740',
    label: 'Чулуун буюу тоосгон өрлөг, засал чимэглэлийн үйлчилгээ'
  },
  {
    value: '2741',
    label: 'Төрөл бүрийн хэвлэх, хувилах үйлчилгээ'
  },
  {
    value: '2791',
    label: 'Үсэг өрөх, хэв бэлдэх үйлчилгээ'
  },
  {
    value: '2842',
    label: 'Цэвэрлэгээ үйлчилгээ'
  },
  {
    value: '4131',
    label: 'Автобусны шугамын үйлчилгээ'
  },
  {
    value: '4214',
    label:
      'Том оврын ачааны машины үйлчилгээ - хол болон ойрын зайн нүүлгэлт, хүргэлтийн үйлчилгээ'
  },
  {
    value: '4215',
    label: 'Шуудангийн үйлчилгээ'
  },
  {
    value: '4225',
    label: 'Агуулах болон хадгалалтын үйлчилгээ'
  },
  {
    value: '4814',
    label: 'Харилцаа холбооны үйлчилгээ'
  },
  {
    value: '4821',
    label: 'Цахилгаан холбооны үйлчилгээ'
  },
  {
    value: '5937',
    label: 'Эртний эдлэл засварлах үйлчилгээ'
  },
  {
    value: '7210',
    label: 'Угаалга, цэвэрлэгээний үйлчилгээ'
  },
  {
    value: '7261',
    label: 'Оршуулга, чандарлах үйлчилгээ'
  },
  {
    value: '7298',
    label: 'Эрүүл мэнд, гоо сайхны үйлчилгээ'
  },
  {
    value: '7299',
    label: 'Бусад үйлчилгээ'
  },
  {
    value: '7311',
    label: 'Зар сурталчилгааны үйлчилгээ'
  },
  {
    value: '7342',
    label: 'Устгалын үйлчилгээ'
  },
  {
    value: '7349',
    label: 'Цэвэрлэгээ, арчилгаа'
  },
  {
    value: '7372',
    label: 'Компьютерын програмчлалын үйлчилгээ'
  },
  {
    value: '7375',
    label: 'Мэдээллийн лавлах үйлчилгээ'
  },
  {
    value: '7379',
    label: 'Компьютер засварын үйлчилгээ'
  },
  {
    value: '7392',
    label: 'Зөвлөх, олон нийттэй харилцах үйлчилгээ'
  },
  {
    value: '7394',
    label: 'Тоног төхөөрөмжийн түрээсийн үйлчилгээ'
  },
  {
    value: '7395',
    label: 'Зураг засварын үйлчилгээ'
  },
  {
    value: '7399',
    label: 'Бусад бизнесийн үйлчилгээ'
  },
  {
    value: '7513',
    label: 'Том оврын машин, чиргүүл түрээслэх үйлчилгээ'
  },
  {
    value: '7535',
    label: 'Автомашин будаж засах үйлчилгээ'
  },
  {
    value: '7549',
    label: 'Ачих, чирэх үйлчилгээ'
  },
  {
    value: '8911',
    label: 'Архитектур зураг төслийн үйлчилгээ'
  },
  {
    value: '8931',
    label: 'Нягтлан бодох бүртгэлийн үйлчилгээ'
  },
  {
    value: '8999',
    label: 'Мэргэжлийн үйлчилгээ'
  },
  {
    value: '5521',
    label:
      'Хуучин моторт тээврийн хэрэгслийн худалдаа, үйлчилгээ, сэлбэг болон түрээс'
  },
  {
    value: '8111',
    label: 'Хуулийн зөвлөгөө, өмгөөллийн үйлчилгээ'
  },
  {
    value: '7276',
    label: 'Татварын зөвлөгөө өгөх үйлчилгээ'
  },
  {
    value: '7277',
    label: 'Зөвлөгөө өгөх үйлчилгээ'
  },
  {
    value: '8398',
    label: 'Буяны байгууллага болон хандив цуглуулах үйл ажиллагаа'
  },
  {
    value: '8641',
    label: 'Иргэдийн, нийгмийн, ах дүүсийн нийгэмлэг'
  },
  {
    value: '8651',
    label: 'Улс төрийн байгууллага'
  },
  {
    value: '8661',
    label: 'Шашны байгууллага'
  },
  {
    value: '8675',
    label: 'Автомашин сонирхогчдын холбоо'
  },
  {
    value: '8699',
    label: 'Гишүүнчлэлийн байгууллага'
  },
  {
    value: '8734',
    label: 'Шинжилгээ судалгааны лаборатори'
  },
  {
    value: '9222',
    label: 'Төрийн үйлчилгээний байгууллагуудын торгууль'
  },
  {
    value: '9311',
    label: 'Татвар төлөлт'
  },
  {
    value: '9399',
    label: 'Төрийн бусад үйлчилгээ'
  },
  {
    value: '7999',
    label: 'Бусад амралт зугаалгын газар'
  },
  {
    value: '7929',
    label: 'Хамтлаг дуучид'
  },
  {
    value: '7998',
    label: 'Аквариум'
  },
  {
    value: '7361',
    label: 'Ажил олгох агентлаг'
  },
  {
    value: '7393',
    label: 'Мөрдөх агентлаг'
  },
  {
    value: '7512',
    label: 'Машин түрээсийн газар'
  },
  {
    value: '7523',
    label: 'Машины зогсоол, гарааш'
  },
  {
    value: '4784',
    label: 'Зам, гүүрний хураамж'
  },
  {
    value: '5541',
    label: 'Автомашины үйлчилгээний цэгүүд'
  },
  {
    value: '5542',
    label: 'Шатахуун түгээх газар'
  },
  {
    value: '5983',
    label: 'Шатахууны жижиглэн худалдаа /non-automotive/'
  },
  {
    value: '7992',
    label: 'Гольфын сургалт'
  },
  {
    value: '7993',
    label: 'Видео тоглоомын хэрэгсэл худалдаа'
  },
  {
    value: '7995',
    label: 'Мөрийтэй тоглоомын газар'
  },
  {
    value: '7932',
    label: 'Биллиард, усан сан'
  },
  {
    value: '7933',
    label: 'Боулингийн газар'
  },
  {
    value: '7829',
    label: 'Зураг авалт, видео бичлэгийн газар'
  },
  {
    value: '7841',
    label: 'Видео хуурцаг түрээсийн газар'
  },
  {
    value: '7922',
    label: 'Үзвэр үйлчилгээний билетийн касс'
  },
  {
    value: '7012',
    label: 'Амралтын байр'
  },
  {
    value: '7032',
    label: 'Спорт, амралт зугаалгын газар'
  },
  {
    value: '7991',
    label:
      'Музей ба түүхийн дурсгалт газар, байшин барилга үзүүлэх үйл ажиллагаа, үзэсгэлэн'
  },
  {
    value: '7996',
    label: 'Цэнгэлдэх хүрээлэн, парк болон цэцэрлэгт хүрээлэнгийн үйл ажиллагаа'
  },
  {
    value: '7622',
    label: 'Цахилгаан барааны засвар'
  },
  {
    value: '7623',
    label: 'Агааржуулалт, хөргөлтийн систем засвар'
  },
  {
    value: '7629',
    label: 'Гэр ахуйн жижиг хэрэгсэл засвар'
  },
  {
    value: '7631',
    label: 'Цаг, үнэт эдлэл засвар'
  },
  {
    value: '7641',
    label: 'Тавилга засвар'
  },
  {
    value: '7692',
    label: 'Гагнуур'
  },
  {
    value: '7699',
    label: 'Бусад засварын газар'
  },
  {
    value: '7531',
    label: 'Автомашин засвар'
  },
  {
    value: '7538',
    label: 'Автомашины үйлчилгээ үзүүлэх газар'
  },
  {
    value: '7251',
    label: 'Гутал засвар/малгай цэвэрлэгээ'
  },
  {
    value: '5814',
    label: 'Түргэн хоолны газар'
  },
  {
    value: '5462',
    label: 'Нарийн боовны газар'
  },
  {
    value: '5811',
    label: 'Хоол хүнс нийлүүлэгч'
  },
  {
    value: '6051',
    label: 'Банк бус санхүүгийн байгууллага'
  },
  {
    value: '6211',
    label: 'Үнэт цаасны брокер/дилер'
  },
  {
    value: '6513',
    label: 'Үл хөдлөх хөрөнгийн агентлаг'
  },
  {
    value: '7321',
    label: 'Зээлийн мэдээллийн агентлаг'
  },
  {
    value: '6011',
    label: 'АТМ-ын гүйлгээ'
  },
  {
    value: '5933',
    label: 'Ломбард'
  },
  {
    value: '1520',
    label: 'Ердийн гэрээт ажилчид'
  },
  {
    value: '1711',
    label: 'Халаалт, сантехник, агааржуулалт'
  },
  {
    value: '1731',
    label: 'Цахилгаан техник'
  },
  {
    value: '1750',
    label: 'Мужаан, дархан'
  },
  {
    value: '1761',
    label: 'Дээврийн ажил'
  },
  {
    value: '1771',
    label: 'Бетон зуурмагийн ажил'
  },
  {
    value: '1799',
    label: 'Бусад үйлчилгээний гэрээт ажилчид'
  },
  {
    value: '5697',
    label: 'Оѐдолчин'
  },
  {
    value: '7211',
    label: 'Угаалгын газар'
  },
  {
    value: '7217',
    label: 'Хивс, бүрээсний цэвэрлэгээ'
  },
  {
    value: '7221',
    label: 'Гэрэл зургийн студи'
  },
  {
    value: '7230',
    label: 'Үсчин, гоо сайхны салон'
  },
  {
    value: '7296',
    label: 'Хувцас түрээс'
  },
  {
    value: '7297',
    label: 'Массажны газар'
  },
  {
    value: '5599',
    label: 'Бусад машин, тоног төхөөрөмжийн худалдаа'
  },
  {
    value: '5044',
    label:
      'Гэрэл зураг хэвлэх, хувилах тоног төхөөрөмж, дагалдах хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5045',
    label:
      'Компьютер, түүний дагалдах хэрэгсэл, програм хангамжийн төрөлжсөн нийлүүлэлт'
  },
  {
    value: '5046',
    label: 'Бусад үйлдвэрлэлийн тоног төхөөрөмжийн нийлүүлэлт'
  },
  {
    value: '5047',
    label:
      'Эрүүл мэнд, шүд, нүд болон эмнэлгийн тоног төхөөрөмж, дагалдах хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5065',
    label: 'Цахилгааны тоног төхөөрөмж, дагалдах хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5072',
    label: 'Техник хэрэгсэл, дагалдах хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5074',
    label:
      'Сантехник, дулааны шугам сүлжээний тоноглол, дагалдах хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5094',
    label: 'Үнэт чулуу, метал, цаг, үнэт эдлэлийн нийлүүлэлт'
  },
  {
    value: '5099',
    label: 'Бусад удаан эдэлгээтэй бараа бүтээгдэхүүний худалдаа'
  },
  {
    value: '5111',
    label:
      'Бичиг хэрэг, оффисын хангамж, бичгийн болон хэвлэлийн цаасны нийлүүлэлт'
  },
  {
    value: '5122',
    label: 'Эм, эмийн бүтээгдэхүүн, эрүүл мэндийн жижиг хэрэгслийн нийлүүлэлт'
  },
  {
    value: '5131',
    label: 'Төрөлжсөн бус барааны нийлүүлэлт'
  },
  {
    value: '5137',
    label: 'Дүрэмт хувцас, ажлын хувцасны нийлүүлэлт'
  },
  {
    value: '5139',
    label: 'Гутлын ханган нийлүүлэлт'
  },
  {
    value: '5169',
    label: 'Химийн бодис, бусад холбогдох бүтээгдэхүүний нийлүүлэлт'
  },
  {
    value: '5199',
    label: 'Богино хугацаанд хэрэглэгдэх бараа бүтээгдэхүүний нийлүүлэлт'
  },
  {
    value: '5691',
    label: 'Эрэгтэй эмэгтэй бэлэн хувцас'
  },
  {
    value: '763',
    label: 'Хөдөө аж ахуйн нэгдэл'
  },
  {
    value: '4121',
    label: 'Такси, дуудлагын үйлчилгээ'
  },
  {
    value: '4899',
    label:
      'Кабель,  сансрын  хиймэл  дагуулаар  телевизийн  шууд  нэвтрүүлэг  дамжуулалт болон бусад төлбөртэй зурагт, радио'
  },
  {
    value: '4900',
    label: 'Орон сууцны контор, СӨХ, ХҮТ'
  },
  {
    value: '5085',
    label: 'Бусад үйлдвэрлэлийн бараа нийлүүлэлт'
  },
  {
    value: '5198',
    label: 'Будаг, лак, орлох бүтээгдэхүүний нийлүүлэлт'
  },
  {
    value: '5511',
    label:
      'Шинэ болон хуучин моторт тээврийн хэрэгслийн худалдаа, үйлчилгээ, сэлбэг болон түрээс'
  },
  {
    value: '5965',
    label: 'Шууд маркетинг, каталог ашиглан бүтээгдэхүүн борлуулагч'
  },
  {
    value: '6399',
    label: 'Даатгалын үйлчилгээ'
  }
];
