export const SUB_MENUS = [
  { title: 'Put Response', link: '/put-responses' },
  { title: 'By Date', link: '/put-responses-by-date' },
  { title: 'Duplicated', link: '/put-responses-duplicated' }
];

export const KEY_LABELS = {
  companyName: 'company name',
  checkCompanyUrl: 'check Company url',
  ebarimtUrl: 'ebarimt Url',
  checkTaxpayerUrl: 'check taxpayer url',
};

export const FILTER_PARAMS = [
  'search',
  'billType',

  'contentType',
  'success',
  'billType',
  'billIdRule',
  'isLast',
  'stageId',
  'pipelineId',
  'orderNumber',
  'dealName',
  'createdStartDate',
  'createdEndDate',
  'paidDate'
];

export const TAX_TYPES = {
  2: {
    label: 'Free',
    percent: '0',
    options: [
      {
        value: '301',
        label:
          '301 - Гаалийн байгууллагаас баталсан, зорчигчдод татваргүй нэвтрүүлэхийг зөвшөөрсөн хэмжээ бүхий биедээ авч яваа хувийн хэрэглээний бараа'
      },
      {
        value: '302',
        label:
          '302 - Монгол Улсын нутаг дэвсгэрт байнга оршин суудаг гадаадын дипломат төлөөлөгчийн болон консулын газар, Нэгдсэн үндэсний байгууллага, түүний төрөлжсөн салбарын хэрэгцээнд зориулан импортоор оруулсан бараа'
      },
      {
        value: '304',
        label:
          '304 - Гадаад улсын Засгийн газар, олон улсын байгууллагаас буцалтгүй болон хүмүүнлэгийн тусламж, хөнгөлөлттэй зээлээр авсан бараа'
      },
      {
        value: '305',
        label:
          '305 - Хөгжлийн бэрхшээлтэй иргэний хэрэглээнд зориулсан тусгай зориулалтын хэрэгсэл, тоног төхөөрөмж, автотээврийн хэрэгсэл'
      },
      {
        value: '306',
        label:
          '306 - Зэвсэгт хүчин, цагдаа, улсын аюулгүй байдлыг хангах, шүүхийн шийдвэр биелүүлэх байгууллагын хэрэгцээнд зориулан импортоор оруулж байгаа зэвсэг, тусгай техник хэрэгсэл'
      },
      {
        value: '307',
        label: '307 - Агаарын зорчигч тээврийн хөлөг, түүний сэлбэг'
      },
      {
        value: '308',
        label:
          '308 - Орон сууцны зориулалтаар ашиглаж байгаа байр буюу түүний хэсгийг борлуулсны орлого'
      },
      {
        value: '310',
        label:
          '310 - Эмчилгээний зориулалтаар хэрэглэх цус, цусан бүтээгдэхүүн, эд эрхтэн'
      },
      {
        value: '311',
        label:
          '311 - Хийн түлш, түүний сав, тоног төхөөрөмж, тусгай зориулалтын машин механизм, техник хэрэгсэл, тоноглол'
      },
      {
        value: '312',
        label:
          '312 - Гадаад улсад захиалгаар хийлгэсэн Монгол Улсын үндэсний мөнгөн тэмдэгт'
      },
      { value: '313', label: '313 - Борлуулсан алт' },
      {
        value: '315',
        label: '315 - Эрдэм шинжилгээ, судалгааны ажлын туршилтын бүтээгдэхүүн'
      },
      {
        value: '421',
        label:
          '421 - энэ хуулийн 12.1.7-д зааснаас бусад экспортод гаргасан ашигт малтмалын бүтээгдэхүүн'
      },
      {
        value: '407',
        label:
          '407 - банк, банк бус санхүүгийн байгууллага болон бусад хуулийн этгээдээс банк, тусгай зориулалтын компани, орон сууцны санхүүжилтийн компанид хөрөнгөөр баталгаажсан үнэт цаас гаргах зориулалтаар шилжүүлсэн зээл, санхүүгийн түрээсийн гэрээнээс үүсэх аливаа шаардах эрх'
      },
      {
        value: '318',
        label:
          '318 - газар тариалан эрхлэгчийн дотооддоо тарьж борлуулсан үр тариа, төмс, хүнсний ногоо, суулгац, жимс жимсгэнэ, үйлдвэрлэсэн гурил'
      },
      {
        value: '319',
        label:
          '319 - Монгол Улсын нутаг дэвсгэрт үйлдвэрийн аргаар төхөөрч бэлтгэн дотооддоо борлуулсан тураг болон шулж ангилсан мах, боловсруулаагүй дотор эрхтэн, дайвар бүтээгдэхүүн;'
      },
      {
        value: '320',
        label:
          '320 - Монгол Улсын нутаг дэвсгэрт дотоодын түүхий эдээр боловсруулан дотооддоо борлуулсан хүнсний сүү, сүүн бүтээгдэхүүн'
      },
      {
        value: '419',
        label:
          '419 - Монгол Улсын нутаг дэвсгэрт үйлдвэрлэсэн, үйлдвэрлэн борлуулсан жижиг, дунд үйлдвэрийн үйлдвэрлэлийн зориулалт бүхий тоног төхөөрөмж, сэлбэг хэрэгсэл;'
      },
      {
        value: '423',
        label:
          '423 - инновацийн төслөөр дотоод, гадаадын зах зээлд шинэ бараа, бүтээгдэхүүний үйлдвэрлэл явуулахад шаардлагатай, дотоодод үйлдвэрлэдэггүй түүхий эд, материал, урвалж бодис;'
      },
      {
        value: '424',
        label:
          '424 - импортоор оруулж байгаа бөөрөнхий мод, гуалин, зүсмэл материал, банз, модон бэлдэц, хагас боловсруулсан модон материал;'
      },
      {
        value: '425',
        label:
          '425 - экспортод гаргасан түүхий болон угаасан, самнасан ноолуур, арьс шир'
      },
      {
        value: '426',
        label:
          '426 - соёлын өвийг судалж шинжлэх, сэргээн засварлахад ашиглах материал, техник, тоног төхөөрөмж, бодис, багаж хэрэгсэл'
      },
      {
        value: '303',
        label:
          '303 - Монгол Улсаас гадаад улсад суугаа дипломат төлөөлөгчийн болон консулын газрын албан ажлын болон тэдгээрт ажиллагсдын хувийн хэрэгцээнд зориулан худалдаж авсан бараа, ажил, үйлчилгээг тухайн улсад албан татвараас чөлөөлдөг бол тэр улсаас Монгол Улсад суугаа дипломат төлөөлөгчийн болон консулын газрын албан ажлын болон тэдгээрт ажиллагсдын хувийн хэрэгцээнд зориулж Монгол Улсын нутаг дэвсгэрт худалдан авсан бараа, гүйцэтгэсэн ажил, үзүүлсэн үйлчилгээ'
      },
      {
        value: '427',
        label:
          '427 - нэг сарын хөдөлмөрийн хөлсний доод хэмжээг 10 дахин, зөөврийн компьютерийн хувьд 30 дахин нэмэгдүүлснээс дээшгүй үнийн дүнтэй, ижил төрлийн хоёроос илүүгүй бараа бүхий хувь хүний нэр дээр илгээсэн улс хоорондын шуудангийн илгээмж'
      },
      {
        value: '309',
        label:
          '309 - гэрээлэгч болон туслан гүйцэтгэгч нь газрын тос, уламжлалт бус газрын тостой холбогдсон үйл ажиллагаанд зориулан хайгуулын нийт хугацаанд болон ашиглалтын эхний таван жилд импортолсон тусгай зориулалтын машин, техник хэрэгсэл, тоног төхөөрөмж, тоноглол, түүхий эд, материал, химийн болон тэсрэх бодис, сэлбэг хэрэгсэл'
      },
      {
        value: '428',
        label:
          '428 - газрын тос болон уламжлалт бус газрын тостой холбогдсон тайлан материал, дээж болон газрын тос'
      },
      {
        value: '429',
        label:
          '429 - чөлөөт бүсэд зорчигчийн худалдаж авсан гурван сая төгрөг хүртэл үнийн дүнтэй бараа'
      },
      { value: '401', label: '401 - валют солих үйлчилгээ' },
      {
        value: '402',
        label:
          '402 - мөнгө хүлээн авах, шилжүүлэх, баталгаа, төлбөрийн нэхэмжлэл гаргах, вексель, хадгаламжийн данстай холбогдсон банкны үйлчилгээ'
      },
      {
        value: '403',
        label:
          '403 - даатгал, даатгалын зуучлал, давхар даатгал, эд хөрөнгийн бүртгэлийн үйлчилгээ'
      },
      {
        value: '404',
        label:
          '404 - үнэт цаас, хувьцаа гаргах, шилжүүлэх, борлуулах, хүлээн авах, тэдгээрт баталгаа гаргах үйлчилгээ'
      },
      { value: '405', label: '405 - зээл олгох үйлчилгээ' },
      {
        value: '406',
        label:
          '406 - нийгмийн болон эрүүл мэндийн даатгалын сангийн мөнгөн хөрөнгийг байршуулсны хүүг олгох, шилжүүлэх үйлчилгээ'
      },
      {
        value: '407',
        label:
          '407 - банкны болон банк бус санхүүгийн байгууллага, хадгаламж зээлийн хоршооны зээлийн хүү, санхүүгийн түрээсийн хүү, ногдол ашиг, зээлийн баталгааны хураамж, даатгалын гэрээний хураамж төлөх үйлчилгээ'
      },
      {
        value: '408',
        label:
          '408 - орон сууцны зориулалтаар баригдсан зориулалтын дагуу ашиглагдаж байгаа байрыг болон түүний тодорхой хэсгийг хөлслүүлэх үйлчилгээ'
      },
      {
        value: '409',
        label:
          '409 - боловсролын болон мэргэжлийн сургалт явуулах тусгай зөвшөөрөлтэй хувь хүн, хуулийн этгээдийн эрхлэн гүйцэтгэж байгаа дүрэмд нь заасан боловсрол, мэргэжил олгох үйлчилгээ'
      },
      { value: '410', label: '410 - эрүүл мэндийн үйлчилгээ' },
      { value: '411', label: '411 - шашны байгууллагын үйлчилгээ' },
      {
        value: '412',
        label:
          '412 - төрийн байгууллагаас үзүүлж байгаа үйлчилгээ. Үүнд Засгийн газар, түүний агентлагууд, төсөвт байгууллагуудаас үзүүлж байгаа төрийн үйлчилгээ хамаарна'
      },
      {
        value: '413',
        label:
          '413 - Автотээврийн тухай хуулийн 3.1.11-д заасан нийтийн тээврийн үйлчилгээ'
      },
      {
        value: '414',
        label:
          '414 - аялал жуулчлалын үйл ажиллагаа эрхэлдэг хуулийн этгээд гадаад улсын аялал жуулчлалын байгууллагатай гэрээ байгуулж жуулчдыг нь хүлээн авах, уг үйлчилгээг төлөвлөх, сурталчлах, бичиг баримтыг нь бүрдүүлэх зэрэг гадаадын жуулчдад үзүүлсэн /туроператор/ үйлчилгээ'
      },
      { value: '430', label: '430 - соёлын өвийг сэргээн засварлах үйлчилгээ' },
      { value: '431', label: '431 - оршуулгын үйлчилгээ' },
      {
        value: '432',
        label:
          '432 - Монгол Улсын Засгийн газраас гадаад улсын Засгийн газар, олон улсын байгууллагатай байгуулж соёрхон баталсан олон улсын гэрээний дагуу санхүүжигдэх бараа, ажил, үйлчилгээ'
      }
    ]
  },
  3: {
    label: '0 percent',
    percent: '0',
    options: [
      {
        value: '501',
        label:
          '501 - Монгол Улсын нутаг дэвсгэрээс экспортод гаргасан, гаалийн байгууллагад мэдүүлсэн бараа'
      },
      {
        value: '502',
        label:
          '502 - Монгол Улсын Олон улсын гэрээнд заасны дагуу Монгол Улсаас гадаад улсад, гадаад улсаас Монгол Улс хүртэл, түүнчлэн гадаад улсаас Монгол Улсын хилээр дамжуулан бусад улсад гаргасан олон улсын зорчигч болон ачаа тээврийн үйлчилгээ'
      },
      {
        value: '503',
        label:
          '503 - Монгол Улсын нутаг дэвсгэрээс гадна үзүүлсэн /албан татвараас чөлөөлсөн үйлчилгээг оролцуулан/ үйлчилгээ'
      },
      {
        value: '504',
        label:
          '504 - Монгол Улсад оршин суугч бус этгээдэд үзүүлсэн үйлчилгээ /түүний дотор албан татвараас чөлөөлсөн үйлчилгээг оролцуулан/'
      },
      {
        value: '505',
        label:
          '505 - олон улсын нислэг үйлдэж байгаа дотоодын болон гадаадын агаарын тээврийн хөлөгт үзүүлэх нислэгийн хөдөлгөөний удирдлага, техникийн болон шатахууны үйлчилгээ, цэвэрлэгээ, нислэгийн явцад нисэх бүрэлдэхүүн, болон зорчигчдод худалдаа, хоол, ундаагаар үйлчилсэн үйлчилгээ'
      },
      {
        value: '506',
        label:
          '506 - Засгийн газар, Монголбанкны захиалгаар дотоодод үйлдвэрлэсэн төрийн одон медаль, мөнгөн тэмдэгт, зоос'
      },
      { value: '507', label: '507 - ашигт малтмалын эцсийн бүтээгдэхүүн' }
    ]
  },
  5: {
    label: 'Inner',
    percent: '0',
    options: []
  },
  ctax: {
    label: 'CityTax',
    options: [
      { value: '0', label: '0024-Жижиглэн худалдаалсан бүх төрлийн архи согтууруудах ундаа' },
      { value: '1', label: '0025-Жижиглэн худалдаагаар борлуулсан бүх төрлийн тамхи' },
      { value: '2', label: '6331000-Зочид буудлын үйлчилгээ' },
      { value: '3', label: '6313000-Амралтын газрын үйлчилгээ' },
      { value: '4', label: '6311110-Рестораны үйлчилгээ' },
      { value: '5', label: '6340000-Баарны үйлчилгээ' },
      { value: '6', label: '8534000-Автомашин угаалгын газар' },
      { value: '7', label: '8714-Авто үйлчилгээ үзүүлэгч' },
    ]
  }
};

export const DISTRICTS = [
  {
    branchCode: '10', branchName: 'Өвөрхангай',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баян-Өндөр' },
      { subBranchCode: '02', subBranchName: 'Бүрд' },
      { subBranchCode: '03', subBranchName: 'Бат-Өлзий' },
      { subBranchCode: '04', subBranchName: 'Баруунбаян-Улаан' },
      { subBranchCode: '05', subBranchName: 'Баянгол' },
      { subBranchCode: '06', subBranchName: 'Гучин-Ус' },
      { subBranchCode: '07', subBranchName: 'Есөн зүйл' },
      { subBranchCode: '08', subBranchName: 'Өлзийт' },
      { subBranchCode: '09', subBranchName: 'Зүүнбаян-Улаан' },
      { subBranchCode: '10', subBranchName: 'Хайрхандулаан' },
      { subBranchCode: '11', subBranchName: 'Нарийнтээл' },
      { subBranchCode: '12', subBranchName: 'Сант' },
      { subBranchCode: '13', subBranchName: 'Тарагт' },
      { subBranchCode: '14', subBranchName: 'Төгрөг' },
      { subBranchCode: '15', subBranchName: 'Уянга' },
      { subBranchCode: '16', subBranchName: 'Богд' },
      { subBranchCode: '17', subBranchName: 'Хужирт' },
      { subBranchCode: '18', subBranchName: 'Хархорин' },
      { subBranchCode: '19', subBranchName: 'Арвайхээр' }
    ]
  },
  {
    branchCode: '11', branchName: 'Өмнөговь',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баяндалай' },
      { subBranchCode: '02', subBranchName: 'Баян-Овоо' },
      { subBranchCode: '03', subBranchName: 'Булган' },
      { subBranchCode: '04', subBranchName: 'Гурвантэс' },
      { subBranchCode: '05', subBranchName: 'Мандал-Овоо' },
      { subBranchCode: '06', subBranchName: 'Манлай' },
      { subBranchCode: '07', subBranchName: 'Номгон' },
      { subBranchCode: '08', subBranchName: 'Ноён' },
      { subBranchCode: '09', subBranchName: 'Ханбогд' },
      { subBranchCode: '10', subBranchName: 'Ханхонгор' },
      { subBranchCode: '11', subBranchName: 'Хүрмэн' },
      { subBranchCode: '12', subBranchName: 'Сэврэй' },
      { subBranchCode: '13', subBranchName: 'Цогт-Овоо' },
      { subBranchCode: '14', subBranchName: 'Цогтцэций' },
      { subBranchCode: '15', subBranchName: 'Даланзадгад' }
    ]
  },
  {
    branchCode: '12', branchName: 'Сүхбаатар',
    subBranches: [
      { subBranchCode: '10', subBranchName: 'Уулбаян' },
      { subBranchCode: '11', subBranchName: 'Халзан' },
      { subBranchCode: '12', subBranchName: 'Эрдэнэцагаан' },
      { subBranchCode: '14', subBranchName: 'Баруун-Урт' },
      { subBranchCode: '01', subBranchName: 'Асгат' },
      { subBranchCode: '02', subBranchName: 'Баяндэлгэр' },
      { subBranchCode: '03', subBranchName: 'Дарьганга' },
      { subBranchCode: '04', subBranchName: 'Мөнххаан' },
      { subBranchCode: '05', subBranchName: 'Наран' },
      { subBranchCode: '06', subBranchName: 'Онгон' },
      { subBranchCode: '07', subBranchName: 'Сүхбаатар' },
      { subBranchCode: '08', subBranchName: 'Түвшинширээ' },
      { subBranchCode: '09', subBranchName: 'Түмэнцогт' }
    ]
  },
  {
    branchCode: '13', branchName: 'Сэлэнгэ',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Сүхбаатар' },
      { subBranchCode: '02', subBranchName: 'Алтанбулаг' },
      { subBranchCode: '03', subBranchName: 'Цагааннуур' },
      { subBranchCode: '04', subBranchName: 'Орхон' },
      { subBranchCode: '05', subBranchName: 'Шаамар' },
      { subBranchCode: '07', subBranchName: 'Баруунбүрэн' },
      { subBranchCode: '08', subBranchName: 'Сант' },
      { subBranchCode: '09', subBranchName: 'Орхонтуул' },
      { subBranchCode: '10', subBranchName: 'Ерөө' },
      { subBranchCode: '11', subBranchName: 'Зүүнбүрэн' },
      { subBranchCode: '12', subBranchName: 'Баянгол' },
      { subBranchCode: '13', subBranchName: 'Хушаат' },
      { subBranchCode: '14', subBranchName: 'Мандал' },
      { subBranchCode: '15', subBranchName: 'Жавхлант' },
      { subBranchCode: '16', subBranchName: 'Сайхан' },
      { subBranchCode: '19', subBranchName: 'Түшиг' },
      { subBranchCode: '21', subBranchName: 'Хүдэр' }
    ]
  },
  {
    branchCode: '14', branchName: 'Төв',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алтанбулаг' },
      { subBranchCode: '02', subBranchName: 'Аргалант' },
      { subBranchCode: '03', subBranchName: 'Архуст' },
      { subBranchCode: '04', subBranchName: 'Батсүмбэр' },
      { subBranchCode: '05', subBranchName: 'Баян' },
      { subBranchCode: '06', subBranchName: 'Баян-Өнжүүл' },
      { subBranchCode: '07', subBranchName: 'Баяндэлгэр' },
      { subBranchCode: '08', subBranchName: 'Баянжаргалан' },
      { subBranchCode: '09', subBranchName: 'Баянхангай' },
      { subBranchCode: '10', subBranchName: 'Баянчандмань' },
      { subBranchCode: '11', subBranchName: 'Баянцагаан' },
      { subBranchCode: '12', subBranchName: 'Баянцогт' },
      { subBranchCode: '13', subBranchName: 'Борнуур' },
      { subBranchCode: '14', subBranchName: 'Бүрэн' },
      { subBranchCode: '15', subBranchName: 'Дэлгэрхаан' },
      { subBranchCode: '16', subBranchName: 'Жаргалант' },
      { subBranchCode: '17', subBranchName: 'Заамар' },
      { subBranchCode: '18', subBranchName: 'Лүн' },
      { subBranchCode: '19', subBranchName: 'Мөнгөнморьт' },
      { subBranchCode: '20', subBranchName: 'Өндөрширээт' },
      { subBranchCode: '21', subBranchName: 'Сэргэлэн' },
      { subBranchCode: '22', subBranchName: 'Сүмбэр' },
      { subBranchCode: '23', subBranchName: 'Угтаалцайдам' },
      { subBranchCode: '24', subBranchName: 'Цээл' },
      { subBranchCode: '25', subBranchName: 'Эрдэнэ' },
      { subBranchCode: '26', subBranchName: 'Эрдэнэсант' },
      { subBranchCode: '27', subBranchName: 'Зуунмод' }
    ]
  },
  {
    branchCode: '15', branchName: 'Увс',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баруунтуруун' },
      { subBranchCode: '02', subBranchName: 'Бөхмөрөн' },
      { subBranchCode: '03', subBranchName: 'Давст' },
      { subBranchCode: '04', subBranchName: 'Завхан' },
      { subBranchCode: '05', subBranchName: 'Зүүнговь' },
      { subBranchCode: '06', subBranchName: 'Зүүнхангай' },
      { subBranchCode: '07', subBranchName: 'Малчин' },
      { subBranchCode: '08', subBranchName: 'Наранбулаг' },
      { subBranchCode: '09', subBranchName: 'Өлгий' },
      { subBranchCode: '10', subBranchName: 'Өмнөговь' },
      { subBranchCode: '11', subBranchName: 'Өндөрхангай' },
      { subBranchCode: '12', subBranchName: 'Сагил' },
      { subBranchCode: '13', subBranchName: 'Тариалан' },
      { subBranchCode: '14', subBranchName: 'Түргэн' },
      { subBranchCode: '15', subBranchName: 'Тэс' },
      { subBranchCode: '17', subBranchName: 'Ховд' },
      { subBranchCode: '18', subBranchName: 'Хяргас' },
      { subBranchCode: '19', subBranchName: 'Цагаанхайрхан' },
      { subBranchCode: '20', subBranchName: 'Улаангом' }
    ]
  },
  {
    branchCode: '16', branchName: 'Ховд',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алтай' },
      { subBranchCode: '02', subBranchName: 'Булган' },
      { subBranchCode: '03', subBranchName: 'Буянт' },
      { subBranchCode: '04', subBranchName: 'Дарви' },
      { subBranchCode: '05', subBranchName: 'Дуут' },
      { subBranchCode: '06', subBranchName: 'Дөргөн' },
      { subBranchCode: '07', subBranchName: 'Зэрэг' },
      { subBranchCode: '08', subBranchName: 'Манхан' },
      { subBranchCode: '09', subBranchName: 'Мөст' },
      { subBranchCode: '10', subBranchName: 'Мянгад' },
      { subBranchCode: '11', subBranchName: 'Мөнххайрхан' },
      { subBranchCode: '12', subBranchName: 'Үенч' },
      { subBranchCode: '13', subBranchName: 'Ховд' },
      { subBranchCode: '14', subBranchName: 'Цэцэг' },
      { subBranchCode: '15', subBranchName: 'Чандмань' },
      { subBranchCode: '16', subBranchName: 'Эрдэнэбүрэн' },
      { subBranchCode: '17', subBranchName: 'Жаргалант' }
    ]
  },
  {
    branchCode: '17', branchName: 'Хөвсгөл',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алаг-Эрдэнэ' },
      { subBranchCode: '02', subBranchName: 'Арбулаг' },
      { subBranchCode: '03', subBranchName: 'Баянзүрх' },
      { subBranchCode: '04', subBranchName: 'Бүрэнтогтох' },
      { subBranchCode: '05', subBranchName: 'Галт' },
      { subBranchCode: '06', subBranchName: 'Жаргалант' },
      { subBranchCode: '07', subBranchName: 'Их-Уул' },
      { subBranchCode: '08', subBranchName: 'Рашаант' },
      { subBranchCode: '09', subBranchName: 'Рэнчинлхүмбэ' },
      { subBranchCode: '10', subBranchName: 'Тариалан' },
      { subBranchCode: '11', subBranchName: 'Тосонцэнгэл' },
      { subBranchCode: '12', subBranchName: 'Төмөрбулаг' },
      { subBranchCode: '13', subBranchName: 'Түнэл' },
      { subBranchCode: '14', subBranchName: 'Улаан-Уул' },
      { subBranchCode: '15', subBranchName: 'Ханх' },
      { subBranchCode: '17', subBranchName: 'Цагаан-Уул' },
      { subBranchCode: '18', subBranchName: 'Цагаан-Үүр' },
      { subBranchCode: '19', subBranchName: 'Цагааннуур' },
      { subBranchCode: '20', subBranchName: 'Цэцэрлэг' },
      { subBranchCode: '21', subBranchName: 'Чандмань-Өндөр' },
      { subBranchCode: '22', subBranchName: 'Шинэ-Идэр' },
      { subBranchCode: '23', subBranchName: 'Эрдэнэбулган' },
      { subBranchCode: '24', subBranchName: 'Мөрөн' }
    ]
  },
  {
    branchCode: '18', branchName: 'Хэнтий',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Галшар' },
      { subBranchCode: '02', subBranchName: 'Баянхутаг' },
      { subBranchCode: '03', subBranchName: 'Баянмөнх' },
      { subBranchCode: '04', subBranchName: 'Дархан' },
      { subBranchCode: '05', subBranchName: 'Дэлгэрхаан' },
      { subBranchCode: '06', subBranchName: 'Жаргалтхаан' },
      { subBranchCode: '07', subBranchName: 'Цэнхэрмандал' },
      { subBranchCode: '08', subBranchName: 'Өмнөдэлгэр' },
      { subBranchCode: '09', subBranchName: 'Батширээт' },
      { subBranchCode: '10', subBranchName: 'Биндэр' },
      { subBranchCode: '11', subBranchName: 'Баян-Адарга' },
      { subBranchCode: '12', subBranchName: 'Дадал' },
      { subBranchCode: '13', subBranchName: 'Норовлин' },
      { subBranchCode: '14', subBranchName: 'Батноров' },
      { subBranchCode: '15', subBranchName: 'Баян-Овоо' },
      { subBranchCode: '16', subBranchName: 'Мөрөн' },
      { subBranchCode: '17', subBranchName: 'Хэрлэн' },
      { subBranchCode: '24', subBranchName: 'Бор-Өндөр' }
    ]
  },
  {
    branchCode: '19', branchName: 'Дархан-Уул',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Дархан' },
      { subBranchCode: '02', subBranchName: 'Шарын гол' },
      { subBranchCode: '03', subBranchName: 'Хонгор' },
      { subBranchCode: '04', subBranchName: 'Орхон' }
    ]
  },
  {
    branchCode: '20', branchName: 'Орхон',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баян-Өндөр' },
      { subBranchCode: '02', subBranchName: 'Жаргалант' }
    ]
  },
  {
    branchCode: '23', branchName: 'Хан-Уул',
    subBranches: [
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо' },
      { subBranchCode: '13', subBranchName: '13-рхороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' },
      { subBranchCode: '20', subBranchName: '20-р хороо' }
    ]
  },
  {
    branchCode: '24', branchName: 'Баянзүрх',
    subBranches: [
      { subBranchCode: '21', subBranchName: '21-р хороо' },
      { subBranchCode: '22', subBranchName: '22-р хороо' },
      { subBranchCode: '23', subBranchName: '23-р хороо' },
      { subBranchCode: '24', subBranchName: '24-р хороо' },
      { subBranchCode: '25', subBranchName: '25-р хороо' },
      { subBranchCode: '26', subBranchName: '26-р хороо' },
      { subBranchCode: '27', subBranchName: '27-р хороо' },
      { subBranchCode: '28', subBranchName: '28-р хороо' },
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо' },
      { subBranchCode: '13', subBranchName: '13-р хороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' },
      { subBranchCode: '20', subBranchName: '20-р хороо' }
    ]
  },
  {
    branchCode: '25', branchName: 'Сүхбаатар дүүрэг',
    subBranches: [
      { subBranchCode: '21', subBranchName: '21-р хороо' },
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо ' },
      { subBranchCode: '13', subBranchName: '13-р хороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' },
      { subBranchCode: '20', subBranchName: '20-р хороо' }
    ]
  },
  {
    branchCode: '26', branchName: 'Баянгол',
    subBranches: [
      { subBranchCode: '21', subBranchName: '21-р хороо' },
      { subBranchCode: '22', subBranchName: '22-р хороо' },
      { subBranchCode: '23', subBranchName: '23-р хороо' },
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо' },
      { subBranchCode: '13', subBranchName: '13-р хороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' },
      { subBranchCode: '20', subBranchName: '20-р хороо' }
    ]
  },
  {
    branchCode: '27', branchName: 'Багануур',
    subBranches: [
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо ' },
      { subBranchCode: '10', subBranchName: '10-р хороо' }
    ]
  },
  {
    branchCode: '28', branchName: 'Багахангай',
    subBranches: [
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо ' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' }
    ]
  },
  {
    branchCode: '29', branchName: 'Налайх',
    subBranches: [
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' }
    ]
  },
  {
    branchCode: '32', branchName: 'Говьсүмбэр',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Сүмбэр' },
      { subBranchCode: '02', subBranchName: 'Баянтал' },
      { subBranchCode: '03', subBranchName: 'Шивээговь' }
    ]
  },
  {
    branchCode: '34', branchName: 'Сонгинохайрхан',
    subBranches: [
      { subBranchCode: '20', subBranchName: '20-р хороо' },
      { subBranchCode: '21', subBranchName: '21-р хороо' },
      { subBranchCode: '22', subBranchName: '22-р хороо' },
      { subBranchCode: '23', subBranchName: '23-р хороо' },
      { subBranchCode: '24', subBranchName: '24-р хороо' },
      { subBranchCode: '25', subBranchName: '25-р хороо' },
      { subBranchCode: '28', subBranchName: '28-р хороо' },
      { subBranchCode: '29', subBranchName: '29-р хороо' },
      { subBranchCode: '30', subBranchName: '30-р хороо' },
      { subBranchCode: '31', subBranchName: '31-р хороо' },
      { subBranchCode: '32', subBranchName: '32-р хороо' },
      { subBranchCode: '26', subBranchName: '26-р хороо' },
      { subBranchCode: '27', subBranchName: '27-р хороо' },
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо' },
      { subBranchCode: '13', subBranchName: '13-р хороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' }
    ]
  },
  {
    branchCode: '35', branchName: 'Чингэлтэй',
    subBranches: [
      { subBranchCode: '01', subBranchName: '1-р хороо' },
      { subBranchCode: '02', subBranchName: '2-р хороо' },
      { subBranchCode: '03', subBranchName: '3-р хороо' },
      { subBranchCode: '04', subBranchName: '4-р хороо' },
      { subBranchCode: '05', subBranchName: '5-р хороо' },
      { subBranchCode: '06', subBranchName: '6-р хороо' },
      { subBranchCode: '07', subBranchName: '7-р хороо' },
      { subBranchCode: '08', subBranchName: '8-р хороо' },
      { subBranchCode: '09', subBranchName: '9-р хороо' },
      { subBranchCode: '10', subBranchName: '10-р хороо' },
      { subBranchCode: '11', subBranchName: '11-р хороо' },
      { subBranchCode: '12', subBranchName: '12-р хороо' },
      { subBranchCode: '13', subBranchName: '13-р хороо' },
      { subBranchCode: '14', subBranchName: '14-р хороо' },
      { subBranchCode: '15', subBranchName: '15-р хороо' },
      { subBranchCode: '16', subBranchName: '16-р хороо' },
      { subBranchCode: '17', subBranchName: '17-р хороо' },
      { subBranchCode: '18', subBranchName: '18-р хороо' },
      { subBranchCode: '19', subBranchName: '19-р хороо' },
      { subBranchCode: '20', subBranchName: '20-р хороо' }
    ]
  },
  {
    branchCode: '01', branchName: 'Архангай',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Их тамир' },
      { subBranchCode: '02', subBranchName: 'Чулуут' },
      { subBranchCode: '03', subBranchName: 'Хангай' },
      { subBranchCode: '04', subBranchName: 'Тариат' },
      { subBranchCode: '05', subBranchName: 'Өндөр-Улаан' },
      { subBranchCode: '06', subBranchName: 'Эрдэнэмандал' },
      { subBranchCode: '07', subBranchName: 'Жаргалант' },
      { subBranchCode: '08', subBranchName: 'Цэцэрлэг' },
      { subBranchCode: '09', subBranchName: 'Хайрхан' },
      { subBranchCode: '10', subBranchName: 'Батцэнгэл' },
      { subBranchCode: '11', subBranchName: 'Өлзийт' },
      { subBranchCode: '12', subBranchName: 'Өгийнуур' },
      { subBranchCode: '13', subBranchName: 'Хашаат' },
      { subBranchCode: '14', subBranchName: 'Хотонт' },
      { subBranchCode: '15', subBranchName: 'Цэнхэр' },
      { subBranchCode: '16', subBranchName: 'Төвшрүүлэх' },
      { subBranchCode: '17', subBranchName: 'Булган' },
      { subBranchCode: '19', subBranchName: 'Цахир' },
      { subBranchCode: '20', subBranchName: 'Эрдэнэбулган' }
    ]
  },
  {
    branchCode: '02', branchName: 'Баян-Өлгий',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алтай' },
      { subBranchCode: '02', subBranchName: 'Алтанцөгц' },
      { subBranchCode: '03', subBranchName: 'Баяннуур' },
      { subBranchCode: '04', subBranchName: 'Бугат' },
      { subBranchCode: '05', subBranchName: 'Булган' },
      { subBranchCode: '06', subBranchName: 'Буянт' },
      { subBranchCode: '07', subBranchName: 'Дэлүүн' },
      { subBranchCode: '08', subBranchName: 'Ногооннуур' },
      { subBranchCode: '09', subBranchName: 'Сагсай' },
      { subBranchCode: '10', subBranchName: 'Толбо' },
      { subBranchCode: '11', subBranchName: 'Улаанхус' },
      { subBranchCode: '12', subBranchName: 'Цэнгэл' },
      { subBranchCode: '14', subBranchName: 'Өлгий' }
    ]
  },
  {
    branchCode: '03', branchName: 'Баянхонгор',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баацагаан' },
      { subBranchCode: '02', subBranchName: 'Баянбулаг' },
      { subBranchCode: '03', subBranchName: 'Баянговь' },
      { subBranchCode: '04', subBranchName: 'Баянлиг' },
      { subBranchCode: '05', subBranchName: 'Баян-Овоо' },
      { subBranchCode: '06', subBranchName: 'Баян-Өндөр' },
      { subBranchCode: '07', subBranchName: 'Баянцагаан' },
      { subBranchCode: '08', subBranchName: 'Богд' },
      { subBranchCode: '09', subBranchName: 'Бөмбөгөр' },
      { subBranchCode: '10', subBranchName: 'Бууцагаан' },
      { subBranchCode: '11', subBranchName: 'Галуут' },
      { subBranchCode: '12', subBranchName: 'Гурванбулаг' },
      { subBranchCode: '13', subBranchName: 'Жаргалант' },
      { subBranchCode: '14', subBranchName: 'Жинст' },
      { subBranchCode: '15', subBranchName: 'Заг' },
      { subBranchCode: '16', subBranchName: 'Өлзийт' },
      { subBranchCode: '17', subBranchName: 'Хүрээмарал' },
      { subBranchCode: '18', subBranchName: 'Шинэжинст' },
      { subBranchCode: '19', subBranchName: 'Эрдэнэцогт' },
      { subBranchCode: '20', subBranchName: 'Баянхонгор' }
    ]
  },
  {
    branchCode: '06', branchName: 'Дорноговь',
    subBranches: [
      { subBranchCode: '08', subBranchName: 'Сайхандулаан' },
      { subBranchCode: '09', subBranchName: 'Улаанбадрах' },
      { subBranchCode: '10', subBranchName: 'Хатанбулаг' },
      { subBranchCode: '11', subBranchName: 'Хөвсгөл' },
      { subBranchCode: '12', subBranchName: 'Эрдэнэ' },
      { subBranchCode: '14', subBranchName: 'Замын-Үүд' },
      { subBranchCode: '17', subBranchName: 'Сайншанд' },
      { subBranchCode: '01', subBranchName: 'Айраг' },
      { subBranchCode: '02', subBranchName: 'Алтанширээ' },
      { subBranchCode: '03', subBranchName: 'Даланжаргалан' },
      { subBranchCode: '04', subBranchName: 'Дэлгэрэх' },
      { subBranchCode: '05', subBranchName: 'Иххэт' },
      { subBranchCode: '06', subBranchName: 'Мандах' },
      { subBranchCode: '07', subBranchName: 'Өргөн' }
    ]
  },
  {
    branchCode: '07', branchName: 'Дорнод',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Баян-Уул' },
      { subBranchCode: '02', subBranchName: 'Баяндун' },
      { subBranchCode: '03', subBranchName: 'Баянтүмэн' },
      { subBranchCode: '04', subBranchName: 'Гурванзагал' },
      { subBranchCode: '05', subBranchName: 'Дашбалбар' },
      { subBranchCode: '06', subBranchName: 'Матад' },
      { subBranchCode: '07', subBranchName: 'Хөлөнбуйр' },
      { subBranchCode: '08', subBranchName: 'Булган' },
      { subBranchCode: '09', subBranchName: 'Сэргэлэн' },
      { subBranchCode: '11', subBranchName: 'Халхгол' },
      { subBranchCode: '12', subBranchName: 'Цагаан-Овоо' },
      { subBranchCode: '13', subBranchName: 'Чулуунхороот' },
      { subBranchCode: '14', subBranchName: 'Чойбалсан' },
      { subBranchCode: '15', subBranchName: 'Хэрлэн' }
    ]
  },
  {
    branchCode: '08', branchName: 'Дундговь',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Адаацаг' },
      { subBranchCode: '02', subBranchName: 'Баянжаргалан' },
      { subBranchCode: '03', subBranchName: 'Говь-Угтаал' },
      { subBranchCode: '04', subBranchName: 'Дэлгэрцогт' },
      { subBranchCode: '05', subBranchName: 'Дэрэн' },
      { subBranchCode: '06', subBranchName: 'Гурвансайхан' },
      { subBranchCode: '07', subBranchName: 'Дэлгэрхангай' },
      { subBranchCode: '08', subBranchName: 'Луус' },
      { subBranchCode: '10', subBranchName: 'Сайнцагаан' },
      { subBranchCode: '11', subBranchName: 'Сайхан-Овоо' },
      { subBranchCode: '12', subBranchName: 'Өлзийт' },
      { subBranchCode: '13', subBranchName: 'Өндөршил' },
      { subBranchCode: '14', subBranchName: 'Хулд' },
      { subBranchCode: '15', subBranchName: 'Цагаандэлгэр' },
      { subBranchCode: '16', subBranchName: 'Эрдэнэдалай' }
    ]
  },
  {
    branchCode: '09', branchName: 'Завхан',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алдархаан' },
      { subBranchCode: '02', subBranchName: 'Асгат' },
      { subBranchCode: '03', subBranchName: 'Баянтэс' },
      { subBranchCode: '04', subBranchName: 'Баянхайрхан' },
      { subBranchCode: '06', subBranchName: 'Дөрвөлжин' },
      { subBranchCode: '07', subBranchName: 'Идэр' },
      { subBranchCode: '08', subBranchName: 'Их-Уул' },
      { subBranchCode: '09', subBranchName: 'Нөмрөг' },
      { subBranchCode: '10', subBranchName: 'Отгон' },
      { subBranchCode: '11', subBranchName: 'Сантмаргац' },
      { subBranchCode: '12', subBranchName: 'Сонгино' },
      { subBranchCode: '13', subBranchName: 'Түдэвтэй' },
      { subBranchCode: '14', subBranchName: 'Тэс' },
      { subBranchCode: '15', subBranchName: 'Тэлмэн' },
      { subBranchCode: '16', subBranchName: 'Улиастай' },
      { subBranchCode: '17', subBranchName: 'Цагаанхайрхан' },
      { subBranchCode: '18', subBranchName: 'Цагаанчулуут' },
      { subBranchCode: '19', subBranchName: 'Цэцэн-Уул' },
      { subBranchCode: '20', subBranchName: 'Шилүүстэй' },
      { subBranchCode: '21', subBranchName: 'Эрдэнэхайрхан' },
      { subBranchCode: '22', subBranchName: 'Яруу' },
      { subBranchCode: '23', subBranchName: 'Завханмандал' },
      { subBranchCode: '24', subBranchName: 'Ургамал' },
      { subBranchCode: '05', subBranchName: 'Тосонцэнгэл' }
    ]
  },
  {
    branchCode: '04', branchName: 'Булган',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Сайхан' },
      { subBranchCode: '02', subBranchName: 'Тэшиг' },
      { subBranchCode: '03', subBranchName: 'Хутаг-Өндөр' },
      { subBranchCode: '04', subBranchName: 'Баян-Агт' },
      { subBranchCode: '05', subBranchName: 'Баяннуур' },
      { subBranchCode: '06', subBranchName: 'Бугат' },
      { subBranchCode: '07', subBranchName: 'Бүрэгхангай' },
      { subBranchCode: '08', subBranchName: 'Гурван Булаг' },
      { subBranchCode: '09', subBranchName: 'Дашинчилэн' },
      { subBranchCode: '10', subBranchName: 'Могод' },
      { subBranchCode: '11', subBranchName: 'Орхон' },
      { subBranchCode: '12', subBranchName: 'Сэлэнгэ' },
      { subBranchCode: '13', subBranchName: 'Хангал' },
      { subBranchCode: '14', subBranchName: 'Рашаант' },
      { subBranchCode: '15', subBranchName: 'Хишиг-Өндөр' },
      { subBranchCode: '16', subBranchName: 'Булган' },
      { subBranchCode: '17', subBranchName: 'Өлзийт' },
      { subBranchCode: '18', subBranchName: 'Хялганат' }
    ]
  },
  {
    branchCode: '05', branchName: 'Говь-Алтай',
    subBranches: [
      { subBranchCode: '01', subBranchName: 'Алтай' },
      { subBranchCode: '03', subBranchName: 'Баян-Уул' },
      { subBranchCode: '04', subBranchName: 'Бигэр' },
      { subBranchCode: '05', subBranchName: 'Бугат' },
      { subBranchCode: '06', subBranchName: 'Жаргалан' },
      { subBranchCode: '07', subBranchName: 'Дарив' },
      { subBranchCode: '08', subBranchName: 'Дэлгэр' },
      { subBranchCode: '09', subBranchName: 'Тайшир' },
      { subBranchCode: '10', subBranchName: 'Тонхил' },
      { subBranchCode: '11', subBranchName: 'Төгрөг' },
      { subBranchCode: '12', subBranchName: 'Халиун' },
      { subBranchCode: '13', subBranchName: 'Хөхморьт' },
      { subBranchCode: '14', subBranchName: 'Цогт' },
      { subBranchCode: '15', subBranchName: 'Цээл' },
      { subBranchCode: '16', subBranchName: 'Чандмань' },
      { subBranchCode: '17', subBranchName: 'Шарга' },
      { subBranchCode: '18', subBranchName: 'Эрдэнэ' },
      { subBranchCode: '19', subBranchName: 'Есөнбулаг' }
    ]
  }
]
