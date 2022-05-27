export const CAR_SELECT_OPTIONS = {
  STATUSES: [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  FUEL_TYPES: [
    { label: '', value: '' },
    { label: 'Дизель', value: 'Diesel' },
    { label: 'Бензин', value: 'Petrol' },
    { label: 'Газ', value: 'Gas' },
    { label: 'Цахилгаан', value: 'Electric' },
    { label: 'Хосолсон', value: 'FlexiFuel' }
  ],
  STEERING_WHEEL: [
    { label: '', value: '' },
    { label: 'Зүүн', value: 'left' },
    { label: 'Баруун', value: 'right' }
  ],
  OWNER_TYPES: [
    { label: '', value: '' },
    { label: 'Өөрийн', value: 'Own' },
    { label: 'Банк бус', value: 'NonBank' },
    { label: 'Банк', value: 'Bank' },
    { label: 'Компани', value: 'Company' },
    { label: 'Бусдын эзэмшил', value: 'OwnershipOfOthers' }
  ],

  MANUFACTURE_TYPES: [
    { label: '', value: '' },
    { label: 'Хятад', value: 'China' },
    { label: 'Япон', value: 'Japan' },
    { label: 'Солонгос', value: 'Korea' },
    { label: 'Орос', value: 'Russia' },
    { label: 'Америк', value: 'USA' },
    { label: 'Герман', value: 'Germany' },
    { label: 'Чех', value: 'Czech' },
    { label: 'Швед', value: 'Sweden' }
  ],

  DRIVING_CLASSIFICATION: [
    { label: '', value: '' },
    { label: 'A', value: 'ClassA' },
    { label: 'B', value: 'ClassB' },
    { label: 'C', value: 'ClassC' },
    { label: 'D', value: 'ClassD' },
    { label: 'E', value: 'ClassE' },
    { label: 'M', value: 'ClassM' }
  ],

  REPAIR_SERVICE_TYPES: [
    { label: '', value: '' },
    { label: 'Өөрөө', value: 'Himself' },
    { label: 'Засварын төвөөр', value: 'RepairCenter' }
  ],

  TRANSMISSION_TYPES: [
    { label: '', value: '' },
    { label: 'Механик', value: 'Mechanic' },
    { label: 'Автомат', value: 'Automatic' },
    { label: 'Хосолсон', value: 'Combined' }
  ],

  ENGINE_CHANGE: [
    { label: '', value: '' },
    { label: 'Тийм', value: 'Yes' },
    { label: 'Үгүй', value: 'No' }
  ],

  LIFT_CHANGE: [
    { label: '', value: '' },
    { label: 'Тийм', value: 'Yes' },
    { label: 'Үгүй', value: 'No' }
  ],

  TRAILER_TYPES: [
    { label: '', value: '' },
    { label: 'Прохов', value: 'Prokhov' },
    { label: 'Эмээл', value: 'Emeel' },
    {
      label: 'Хамааралгүй',
      value: 'DoesNotMatter'
    }
  ],

  TIRE_LOAD_TYPES: [
    { label: '', value: '' },
    { label: 'Дан', value: 'Only' },
    { label: 'Давхар', value: 'Double' }
  ],

  BOW_TYPES: [
    { label: '', value: '' },
    { label: 'Хий', value: 'Gas' },
    { label: 'Төмөр', value: 'Iron' }
  ],

  BRAKE_TYPES: [
    { label: '', value: '' },
    { label: 'Тэлдэг', value: 'Expand' },
    { label: 'Хавчдаг', value: 'Clamp' },
    { label: 'Уулын', value: 'Mount' },
    { label: 'Хөдөлгүүрийн', value: 'Engine' }
  ],

  FLOOR_TYPE: [
    { label: '', value: '' },
    { label: 'Модон', value: 'Wooden' },
    { label: 'Төмрөн', value: 'Iron' }
  ],

  LIFT_TYPE: [
    { label: '', value: '' },
    { label: 'Кран', value: 'Kran' },
    { label: 'Сэрээт ачигч', value: 'Forklift' },
    { label: 'Ковш', value: 'Kovsh' },
    { label: 'Экска', value: 'Exca' }
  ],

  DOOR_CHANGE: [
    { label: '', value: '' },
    { label: '2', value: 'Door2' },
    { label: '3', value: 'Door3' },
    { label: '4', value: 'Door4' },
    { label: '5', value: 'Door5' },
    { label: '6', value: 'Door6' },
    { label: '7', value: 'Door7' }
  ],

  SEAT_CHANGE: [
    { label: '', value: '' },
    { label: '1', value: 'Seat1' },
    { label: '2', value: 'Seat2' },
    { label: '3', value: 'Seat3' },
    { label: '4', value: 'Seat4' },
    { label: '5', value: 'Seat5' },
    { label: '6', value: 'Seat6' }
  ],

  INTERVAL_TYPES: [
    { label: '', value: '' },
    { label: 'м/цаг', value: 'Mh' },
    { label: 'км', value: 'Km' },
    { label: 'улирал', value: 'Season' }
  ],

  RUNNING_TYPES: [
    { label: '', value: '' },
    { label: 'км', value: 'Km' },
    { label: 'мото/цаг/', value: 'Moto_h' }
  ],

  WAGON_CAPACITY_TYPES: [
    { label: '', value: '' },
    { label: 'тон', value: 'Ton' },
    { label: 'л', value: 'Litre' },
    { label: 'м3', value: 'M3' }
  ],

  LIFT_WAGON_CAPACITY_TYPES: [
    { label: '', value: '' },
    { label: 'тон', value: 'Ton' },
    { label: 'л', value: 'Litre' },
    { label: 'м3', value: 'M3' }
  ],

  COLLAPSE_CONTENT_SELECTOR: [
    { label: '', value: '' },
    { label: 'Ерөнхий мэдээлэл', value: 'renderMain' },
    { label: 'Техник үзүүлэлт', value: 'renderTechnicalSpecification' },
    { label: 'Тэвшний мэдээлэл', value: 'renderWagonInformation' },
    { label: 'Торхны мэдээлэл', value: 'renderBarrelInformation' },
    { label: 'Тээврийн хэрэгслийн зураг', value: 'renderVehicleImages' },
    { label: 'Зүтгэх хүчний мэдээлэл', value: 'renderForceImformation' }
  ]
};

export const PARTICIPATION_STATUSES = {
  PARTICIPATING: 'participating',
  LOSE: 'lose',
  WON: 'won',
  ALL: ['participating', 'lose', 'won']
};

export const PROVINCES = [
  { name: 'Улаанбаатар', capital: 'Улаанбаатар', value: 'ulaanbaatar' },
  { name: 'Архангай', capital: 'Цэцэрлэг хот', value: 'arkhangai' },
  { name: 'Баян-Өлгий', capital: 'Өлгий', value: 'bayanulgii' },
  { name: 'Баянхонгор', capital: 'Баянхонгор', value: 'bayankhongor' },
  { name: 'Булган', capital: 'Булган', value: 'bulgan' },
  { name: 'Говь-Алтай', capital: 'Алтай', value: 'govialtai' },
  { name: 'Говьсүмбэр', capital: '	Чойр', value: 'govisumber' },
  { name: 'Дархан-Уул', capital: 'Дархан', value: 'darkhan' },
  { name: 'Дорноговь', capital: 'Сайншанд', value: 'dornogovi' },
  { name: 'Дорнод', capital: 'Чойбалсан', value: 'dornod' },
  { name: 'Дундговь', capital: 'Мандалговь', value: 'dundgovi' },
  { name: 'Завхан', capital: 'Улиастай', value: 'zavkhan' },
  { name: 'Орхон', capital: 'Эрдэнэт', value: 'erdenet' },
  { name: 'Өвөрхангай	', capital: 'Арвайхээр', value: 'uvurkhangai' },
  { name: 'Өмнөговь', capital: '	Даланзадгад', value: 'umnugovi' },
  { name: 'Сүхбаатар', capital: 'Баруун-Урт', value: 'sukhbaatar' },
  { name: 'Сэлэнгэ', capital: 'Сүхбаатар', value: 'selenge' },
  { name: 'Төв', capital: 'Зуунмод', value: 'tuv' },
  { name: 'Увс', capital: '	Улаангом', value: 'uvs' },
  { name: 'Ховд', capital: 'Ховд', value: 'khovd' },
  { name: 'Хөвсгөл', capital: 'Мөрөн', value: 'khuvsgul' },
  { name: 'Хэнтий', capital: 'Чингис', value: 'khentii' }
];

export const CITIES = [
  {
    city: 'ulaanbaatar',
    city_mn: 'Улаанбаатар',
    lat: '47.9203',
    lng: '106.9172',
    province: 'ulaanbaatar',
    label: 'Улаанбаатар'
  },
  {
    city: 'Murun',
    city_mn: 'Мөрөн',
    lat: '49.6375',
    lng: '100.1614',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Erdenet',
    city_mn: 'Эрдэнэт',
    lat: '49.0333',
    lng: '104.0833',
    province: 'orkhon',
    label: 'Орхон'
  },
  {
    city: 'Darhan',
    city_mn: 'Дархан',
    lat: '49.4867',
    lng: '105.9228',
    province: 'darkhan-uul',
    label: 'Дархан-Уул'
  },
  {
    city: 'Javkhlant',
    city_mn: 'Жавхлант',
    lat: '49.6167',
    lng: '106.3500',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Choibalsan',
    city_mn: 'Чойбалсан',
    lat: '48.0706',
    lng: '114.5228',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'ulgii',
    city_mn: 'Өлгий',
    lat: '48.9656',
    lng: '89.9632',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Ulaangom',
    city_mn: 'Улаангом',
    lat: '49.9833',
    lng: '92.0667',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'bayankhongor',
    city_mn: 'Баянхонгор',
    lat: '46.1944',
    lng: '100.7181',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'hovd',
    city_mn: 'Ховд',
    lat: '48.0167',
    lng: '91.5667',
    province: 'hovd'
  },
  {
    city: 'sukhbaatar',
    city_mn: 'Сүхбаатар',
    lat: '50.2364',
    lng: '106.2064',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Uliastay',
    city_mn: 'Улиастай',
    lat: '47.7417',
    lng: '96.8444',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Arvayheer',
    city_mn: 'Арвайхээр',
    lat: '46.2639',
    lng: '102.7750',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Saynshand',
    city_mn: 'Сайншанд',
    lat: '44.8917',
    lng: '110.1367',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Dalanzadgad',
    city_mn: 'Даланзадгад',
    lat: '43.5700',
    lng: '104.4258',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Dzuunharaa',
    city_mn: 'Зүүнхараа',
    lat: '48.8666',
    lng: '106.4666',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Tsetserleg',
    city_mn: 'Цэцэрлэг',
    lat: '47.4769',
    lng: '101.4503',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Dzuunmod',
    city_mn: 'Зуунмод',
    lat: '47.7069',
    lng: '106.9494',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Altay',
    city_mn: 'Алтай',
    lat: '46.3728',
    lng: '96.2572',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'undurhaan',
    city_mn: 'Чингисхаан',
    lat: '47.3167',
    lng: '110.6500',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Baruun-Urt',
    city_mn: 'Баруун Урт',
    lat: '46.6806',
    lng: '113.2792',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'bulgan',
    city_mn: 'Булган',
    lat: '48.8103',
    lng: '103.5408',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Ulaan-Uul',
    city_mn: 'Улаан уул',
    lat: '44.3337',
    lng: '111.2333',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Mandalgovi',
    city_mn: 'Мандалговь',
    lat: '45.7667',
    lng: '106.2708',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Hudrugu',
    city_mn: 'Хөдрөгө',
    lat: '48.9664',
    lng: '96.7833',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Dalandzadgad',
    city_mn: 'Даланзадгад',
    lat: '43.5708',
    lng: '104.4250',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Choir',
    city_mn: 'Чойр',
    lat: '46.3611',
    lng: '108.3611',
    province: 'govisumber',
    label: 'Говьсүмбэр'
  },
  {
    city: 'Buga',
    city_mn: 'Буга',
    lat: '48.9500',
    lng: '89.9833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Tsagaanders',
    city_mn: 'Цагаандэрс',
    lat: '48.0500',
    lng: '114.3667',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Ihsuuj',
    city_mn: 'Ихсүүж',
    lat: '48.2333',
    lng: '106.2833',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Jargalant',
    city_mn: 'Жаргалант',
    lat: '49.1291',
    lng: '104.4080',
    province: 'orkhon',
    label: 'Орхон'
  },
  {
    city: 'Nart',
    city_mn: 'Нарт',
    lat: '49.1450',
    lng: '105.3883',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Hotol',
    city_mn: 'Хөтөл',
    lat: '49.1333',
    lng: '105.6000',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Dzuunkharaa',
    city_mn: 'Зүүнхараа',
    lat: '48.6333',
    lng: '106.7333',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Delgerhaan',
    city_mn: 'Дэлгэрхаан',
    lat: '50.1039',
    lng: '106.1917',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Harhorin',
    city_mn: 'Хархорин',
    lat: '47.2000',
    lng: '102.8333',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Murun',
    city_mn: 'Мөрөн',
    lat: '47.4013',
    lng: '110.1252',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Javhlant',
    city_mn: 'Жавхлант',
    lat: '48.7500',
    lng: '106.0000',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Shiveegovi',
    city_mn: 'Шивээговь',
    lat: '46.1056',
    lng: '108.6206',
    province: 'govisumber',
    label: 'Говьсүмбэр'
  },
  {
    city: 'Ongi',
    city_mn: 'Онги',
    lat: '46.4667',
    lng: '102.2833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Bornuur',
    city_mn: 'Борнуур',
    lat: '48.4667',
    lng: '106.2667',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Hujirt',
    city_mn: 'Хужирт',
    lat: '46.9167',
    lng: '102.8000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Jargalant',
    city_mn: 'Жаргалант',
    lat: '48.5206',
    lng: '105.8683',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Ulaanshiveet',
    city_mn: 'Улааншивээт',
    lat: '47.2895',
    lng: '103.8566',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Mandal',
    city_mn: 'Мандал',
    lat: '48.3833',
    lng: '106.7500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Surt',
    city_mn: 'Сурт',
    lat: '49.3261',
    lng: '104.3711',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Baruunharaa',
    city_mn: 'Баруунхараа',
    lat: '48.9117',
    lng: '106.0867',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Tes',
    city_mn: 'Тэс',
    lat: '49.6500',
    lng: '95.7667',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Tavanbulag',
    lat: '47.3833',
    lng: '101.8833',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'uvt',
    lat: '46.8167',
    lng: '102.2500',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Darhan',
    lat: '46.6167',
    lng: '109.4167',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Jargalant',
    lat: '50.0675',
    lng: '105.8806',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Bat-uldziit',
    lat: '48.2111',
    lng: '104.7597',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Bor-undur',
    lat: '46.2558',
    lng: '109.4250',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'selenge',
    lat: '49.4333',
    lng: '101.4667',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Huhtolgoi',
    lat: '49.2667',
    lng: '90.9000',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Tsul-Ulaan',
    lat: '47.8333',
    lng: '104.5000',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Bayannuur',
    lat: '48.9333',
    lng: '91.1333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Rashaant',
    lat: '49.1267',
    lng: '101.4281',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Hongor',
    lat: '49.2301',
    lng: '105.8967',
    province: 'darkhan-uul',
    label: 'Дархан-Уул'
  },
  {
    city: 'Sharïngol',
    lat: '49.2560',
    lng: '106.4313',
    province: 'darkhan-uul',
    label: 'Дархан-Уул'
  },
  {
    city: 'Orgil',
    lat: '48.5872',
    lng: '99.3508',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Tsengel',
    lat: '49.4783',
    lng: '100.8894',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Hotont',
    lat: '47.3667',
    lng: '102.4667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Altanbulag',
    lat: '50.3071',
    lng: '106.4991',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Ar-Asgat',
    lat: '48.2622',
    lng: '105.4119',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Bayantsagaan',
    lat: '48.7317',
    lng: '100.7600',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Jargalant',
    lat: '49.6667',
    lng: '106.3333',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Tooromt',
    lat: '50.4667',
    lng: '93.5833',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'orkhon',
    lat: '49.8361',
    lng: '106.1340',
    province: 'darkhan-uul',
    label: 'Дархан-Уул'
  },
  {
    city: 'Enhtal',
    lat: '49.2475',
    lng: '105.3736',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Badrah',
    lat: '49.6183',
    lng: '101.9897',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Hushuut',
    lat: '48.1025',
    lng: '102.5458',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Dzegstey',
    lat: '47.6500',
    lng: '102.5667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Baruunsuu',
    lat: '43.6972',
    lng: '105.7364',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Jargalant',
    lat: '49.2667',
    lng: '100.2500',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Altan-Ovoo',
    lat: '47.4500',
    lng: '101.7833',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Arhust',
    lat: '47.5152',
    lng: '107.9384',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'uldziit',
    lat: '48.5356',
    lng: '101.3667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Orgil',
    lat: '48.4167',
    lng: '105.3333',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Hujirt',
    lat: '48.8886',
    lng: '101.2322',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Harhiraa',
    lat: '49.7667',
    lng: '91.9000',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Ider',
    lat: '48.7728',
    lng: '99.8739',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Asgat',
    lat: '49.5108',
    lng: '96.7994',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Uubulan',
    lat: '48.6139',
    lng: '101.9286',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Tosontsengel',
    lat: '48.7567',
    lng: '98.2839',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Dund-Urt',
    lat: '48.0379',
    lng: '105.9219',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Erdenet',
    lat: '48.9528',
    lng: '99.5333',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Tsagaannuur',
    lat: '49.5155',
    lng: '89.7431',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Chihertey',
    lat: '48.3000',
    lng: '89.5000',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Bayshint',
    lat: '49.6667',
    lng: '90.2833',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Nogoonnuur',
    lat: '49.6000',
    lng: '90.2333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'orkhontuul',
    lat: '48.9497',
    lng: '104.9758',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Ulaanhudag',
    lat: '47.3333',
    lng: '104.5000',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Hushuut',
    lat: '48.9333',
    lng: '89.1333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Mayhan',
    lat: '46.0833',
    lng: '103.8333',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Tsagaantungi',
    lat: '49.0500',
    lng: '90.4500',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Biluu',
    lat: '49.0333',
    lng: '89.3833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Manhan',
    lat: '50.1214',
    lng: '100.0431',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Munhbulag',
    lat: '46.7500',
    lng: '103.5167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Tolbo',
    lat: '48.4167',
    lng: '90.2833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Bayan',
    lat: '47.4500',
    lng: '103.1500',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Ulaanhad',
    lat: '47.9333',
    lng: '105.5500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Uujim',
    lat: '48.9000',
    lng: '89.6167',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Huurch',
    lat: '50.1036',
    lng: '105.4200',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Altanteel',
    lat: '47.1000',
    lng: '92.8500',
    province: 'hovd'
  },
  {
    city: 'Tsagaan Ovoo',
    lat: '45.9500',
    lng: '101.4833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Rashaant',
    lat: '47.7667',
    lng: '90.8333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Buyant',
    lat: '48.5667',
    lng: '89.5333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Argalant',
    lat: '47.9333',
    lng: '105.8667',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Namir',
    lat: '49.1000',
    lng: '91.7167',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Teel',
    lat: '48.0464',
    lng: '100.5092',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Bayan-Ulaan',
    lat: '46.5167',
    lng: '102.5833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Bumbat',
    lat: '46.4667',
    lng: '104.1000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Bayan-Uhaa',
    lat: '48.5500',
    lng: '98.6667',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Huremt',
    lat: '48.6631',
    lng: '102.6228',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Bayan',
    lat: '49.4333',
    lng: '99.6000',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Dundburd',
    lat: '47.9167',
    lng: '111.5000',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Jargalant',
    lat: '46.9167',
    lng: '91.0833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий'
  },
  {
    city: 'Burenhayrhan',
    lat: '46.0833',
    lng: '91.5667',
    province: 'hovd'
  },
  {
    city: 'Bulag',
    lat: '49.8500',
    lng: '100.6167',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Maanit',
    lat: '48.2967',
    lng: '103.4256',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Horgo',
    lat: '48.1600',
    lng: '99.8756',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Bayanhushuu',
    lat: '48.2333',
    lng: '91.9167',
    province: 'hovd'
  },
  {
    city: 'Jargalant',
    lat: '47.7833',
    lng: '101.9667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Lun',
    lat: '47.8667',
    lng: '105.2500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Ongon',
    lat: '46.9667',
    lng: '103.7833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Avdzaga',
    lat: '47.6333',
    lng: '103.5167',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Burgaltay',
    lat: '49.2786',
    lng: '104.7353',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Bayantal',
    lat: '46.5622',
    lng: '108.3044',
    province: 'govisumber',
    label: 'Говьсүмбэр'
  },
  {
    city: 'Suuj',
    lat: '47.8500',
    lng: '104.0500',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Shiree',
    lat: '45.8500',
    lng: '103.4000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Sangiin Dalay',
    lat: '46.6500',
    lng: '103.3167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Bayandelger',
    lat: '47.7333',
    lng: '108.1167',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Dzaanhoshuu',
    lat: '47.5000',
    lng: '100.8667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Buyant',
    lat: '48.0667',
    lng: '91.8167',
    province: 'hovd'
  },
  {
    city: 'Hanhuhii',
    lat: '47.6167',
    lng: '112.1333',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Erhet',
    lat: '48.2806',
    lng: '102.9747',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Altraga',
    lat: '50.2111',
    lng: '98.9508',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Dzadgay',
    lat: '46.1833',
    lng: '99.5667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Jargalant',
    lat: '47.5333',
    lng: '100.2167',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Bayan',
    lat: '48.5500',
    lng: '111.0833',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Jargalant',
    lat: '49.2667',
    lng: '95.4333',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Sharga',
    lat: '49.0503',
    lng: '102.0806',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Huremt',
    lat: '46.3000',
    lng: '102.4667',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Hushaat',
    lat: '49.5000',
    lng: '105.6167',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Sharga',
    lat: '49.8000',
    lng: '98.8000',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Erdenetsogt',
    lat: '46.4167',
    lng: '100.8000',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Mandal',
    lat: '49.9000',
    lng: '99.4333',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Tsenher',
    lat: '46.9167',
    lng: '92.1167',
    province: 'hovd'
  },
  {
    city: 'Bulagiin Denj',
    lat: '47.3167',
    lng: '101.1000',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Darhan',
    lat: '48.2333',
    lng: '103.9500',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Havtsal',
    lat: '50.1000',
    lng: '91.6667',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Hutag',
    lat: '49.3950',
    lng: '102.6933',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Har-Us',
    lat: '48.4833',
    lng: '91.4333',
    province: 'hovd'
  },
  {
    city: 'Har-Us',
    lat: '49.0333',
    lng: '92.0333',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Turt',
    lat: '51.5125',
    lng: '100.6639',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Ihbulag',
    lat: '43.2000',
    lng: '107.2000',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Bugant',
    lat: '49.5833',
    lng: '106.8500',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Tsomog',
    lat: '45.9167',
    lng: '109.0667',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Bulagtay',
    lat: '49.7667',
    lng: '107.5500',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Hushigiin-Ar',
    lat: '47.5572',
    lng: '106.9633',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Tsetsegnuur',
    lat: '46.6000',
    lng: '93.2667',
    province: 'hovd'
  },
  {
    city: 'Baruunturuun',
    lat: '49.6500',
    lng: '94.3833',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Zuunhuvuu',
    lat: '50.6128',
    lng: '92.4022',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Ulaantolgoi',
    lat: '46.6833',
    lng: '92.7833',
    province: 'hovd'
  },
  {
    city: 'Tugrug',
    lat: '47.4167',
    lng: '92.2167',
    province: 'hovd'
  },
  {
    city: 'Ulaan-Uul',
    lat: '46.0833',
    lng: '100.8333',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Hunt',
    lat: '47.8667',
    lng: '99.4667',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Bayantuhum',
    lat: '46.9167',
    lng: '105.0500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Duut',
    lat: '47.5167',
    lng: '91.6333',
    province: 'hovd'
  },
  {
    city: 'Tsagaandurvulj',
    lat: '45.8000',
    lng: '109.3333',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Avraga',
    lat: '47.1833',
    lng: '109.1667',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'uvugdii',
    lat: '48.6428',
    lng: '97.6186',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Dzag',
    lat: '46.9333',
    lng: '99.1667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Maanit',
    lat: '47.2500',
    lng: '107.5333',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Onon',
    lat: '48.6167',
    lng: '110.6000',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Huuvur',
    lat: '45.1667',
    lng: '101.4000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Dzel',
    lat: '49.9000',
    lng: '93.7833',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Bayanhushuu',
    lat: '46.7167',
    lng: '100.1333',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Horiult',
    lat: '45.2000',
    lng: '100.7667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Tsetserleg',
    lat: '49.2667',
    lng: '94.8500',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Bugat',
    lat: '49.5333',
    lng: '93.8167',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Javarthushuu',
    lat: '49.1500',
    lng: '112.7333',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Hujirt',
    lat: '46.6000',
    lng: '104.5833',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Jargalant',
    lat: '47.1500',
    lng: '99.6333',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Jargalant',
    lat: '45.7000',
    lng: '97.1667',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Mardzad',
    lat: '45.9500',
    lng: '102.0500',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Tavin',
    lat: '46.4167',
    lng: '105.7833',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Holboo',
    lat: '48.5833',
    lng: '95.4500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Huhuu',
    lat: '50.4728',
    lng: '100.9278',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Tegsh',
    lat: '48.7333',
    lng: '96.0000',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Sangiin Dalay',
    lat: '46.0000',
    lng: '104.9500',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Tsahir',
    lat: '48.0797',
    lng: '98.8517',
    province: 'arkhangai',
    label: 'Архангай'
  },
  {
    city: 'Mandal',
    lat: '48.6311',
    lng: '103.5292',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Naranbulag',
    lat: '49.3667',
    lng: '92.5667',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Ovoot',
    lat: '45.3000',
    lng: '113.8667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Sergelen',
    lat: '46.2000',
    lng: '111.8167',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Bayasgalant',
    lat: '46.9833',
    lng: '112.0500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Jibhalant',
    lat: '47.7833',
    lng: '112.1167',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Shireet',
    lat: '45.7167',
    lng: '112.3500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Eg-Uur',
    lat: '50.1094',
    lng: '101.5753',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'hovd',
    lat: '44.6667',
    lng: '102.3833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Huhburd',
    lat: '46.2667',
    lng: '100.4667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Balgatay',
    lat: '46.9000',
    lng: '97.1500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'urgun',
    lat: '44.7333',
    lng: '100.3667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Tsalgar',
    lat: '49.7167',
    lng: '93.2667',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Dzelter',
    lat: '50.3156',
    lng: '105.0458',
    province: 'selenge',
    label: 'Сэлэнгэ'
  },
  {
    city: 'Altanbulag',
    lat: '49.3000',
    lng: '96.3333',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Bugat',
    lat: '49.0667',
    lng: '103.6658',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Bayan',
    lat: '46.2500',
    lng: '110.1667',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Dzuunbulag',
    lat: '46.3833',
    lng: '112.1833',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Tsagaannuur',
    lat: '51.3564',
    lng: '99.3444',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Urdgol',
    lat: '47.8333',
    lng: '92.6500',
    province: 'hovd'
  },
  {
    city: 'Dzuulun',
    lat: '51.1125',
    lng: '99.6694',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Dzuunmod',
    lat: '48.2125',
    lng: '97.3786',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Seer',
    lat: '48.3167',
    lng: '92.6333',
    province: 'hovd'
  },
  {
    city: 'Bayanbulag',
    lat: '46.8000',
    lng: '98.1000',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Bayanbulag',
    lat: '45.0000',
    lng: '98.9167',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Buyant',
    lat: '46.1500',
    lng: '98.6667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Ingettolgoi',
    lat: '49.4617',
    lng: '103.9742',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Harmod',
    lat: '50.3333',
    lng: '91.6667',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Halban',
    lat: '49.5000',
    lng: '97.6000',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'uyunch',
    lat: '46.0500',
    lng: '92.0167',
    province: 'hovd'
  },
  {
    city: 'Ulaan-Ereg',
    lat: '46.9000',
    lng: '109.7500',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Bayan-Ovoo',
    lat: '49.0167',
    lng: '111.6333',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Darvi',
    lat: '46.4500',
    lng: '94.1167',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Modot',
    lat: '47.7500',
    lng: '109.0500',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'oigon',
    lat: '49.0000',
    lng: '96.5500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Bayshint',
    lat: '47.4167',
    lng: '104.8167',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Hoolt',
    lat: '45.5333',
    lng: '102.9833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Amardalay',
    lat: '46.1333',
    lng: '106.3833',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Buyanbat',
    lat: '46.9833',
    lng: '95.9500',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Teshig',
    lat: '49.9553',
    lng: '102.6133',
    province: 'bulgan',
    label: 'Булган'
  },
  {
    city: 'Huuvur',
    lat: '48.4000',
    lng: '113.4333',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Bayasgalant',
    lat: '47.1833',
    lng: '108.2500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Tsagaanchuluut',
    lat: '47.0833',
    lng: '96.6500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Songino',
    lat: '48.8833',
    lng: '95.8833',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'bulgan',
    lat: '46.9500',
    lng: '93.6333',
    province: 'hovd'
  },
  {
    city: 'Altay',
    lat: '49.6833',
    lng: '96.3333',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Haliun',
    lat: '45.9333',
    lng: '96.1500',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Munduuhuu',
    lat: '49.4000',
    lng: '94.2333',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Chonogol',
    lat: '45.9000',
    lng: '115.3667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Arguut',
    lat: '45.4500',
    lng: '102.4167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай'
  },
  {
    city: 'Bayan',
    lat: '47.9167',
    lng: '112.9500',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Bayan',
    lat: '46.9833',
    lng: '95.1833',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Altanbulag',
    lat: '47.7000',
    lng: '106.4000',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Ongi',
    lat: '45.4500',
    lng: '103.9000',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Tsant',
    lat: '46.1833',
    lng: '106.7167',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Tseel',
    lat: '45.5667',
    lng: '95.8667',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Hongor',
    lat: '45.1667',
    lng: '113.6667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Bayanbulag',
    lat: '47.8667',
    lng: '109.9167',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Uldz',
    lat: '48.6667',
    lng: '111.9833',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Havirga',
    lat: '45.6667',
    lng: '113.0833',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Taygan',
    lat: '46.3500',
    lng: '97.2833',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Tugul',
    lat: '50.6833',
    lng: '99.2333',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Nart',
    lat: '47.7204',
    lng: '107.7956',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Talshand',
    lat: '45.3333',
    lng: '97.9833',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Hajuu-Us',
    lat: '46.0667',
    lng: '107.5000',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Hongor',
    lat: '45.8000',
    lng: '111.2000',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Tsagaan-Ovoo',
    lat: '45.5167',
    lng: '105.7500',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Tsagaan-Olom',
    lat: '46.7000',
    lng: '96.5000',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Hoviin Am',
    lat: '47.2667',
    lng: '98.5333',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Sergelen',
    lat: '48.5667',
    lng: '114.0833',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Naranbulag',
    lat: '49.2333',
    lng: '113.3667',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Bodi',
    lat: '45.4000',
    lng: '100.5667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'bulgan',
    lat: '44.1128',
    lng: '103.5425',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Hashaat',
    lat: '45.2500',
    lng: '104.8333',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Dashbalbar',
    lat: '49.5333',
    lng: '114.4000',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Tugrug',
    lat: '45.7667',
    lng: '94.9333',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Buhut',
    lat: '45.2500',
    lng: '108.2833',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Bayansayr',
    lat: '45.5500',
    lng: '99.4167',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Buyant',
    lat: '46.2500',
    lng: '110.8333',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Bayanbaraat',
    lat: '46.8667',
    lng: '106.2500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Argatay',
    lat: '45.7667',
    lng: '107.9833',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Bayan',
    lat: '47.1667',
    lng: '110.8167',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Aldar',
    lat: '47.7000',
    lng: '96.6000',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Hatavch',
    lat: '46.1667',
    lng: '112.9500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Herlen',
    lat: '47.3000',
    lng: '110.5667',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Sharga',
    lat: '46.2500',
    lng: '95.2667',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Sharbulag',
    lat: '48.8167',
    lng: '93.1000',
    province: 'uvs',
    label: 'Увс'
  },
  {
    city: 'Shiree',
    lat: '47.5000',
    lng: '96.8500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Chandmani',
    lat: '48.0500',
    lng: '96.2500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Dzuyl',
    lat: '46.2667',
    lng: '93.9167',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Eg',
    lat: '48.6833',
    lng: '110.1833',
    province: 'khentii',
    label: 'Хэнтий'
  },
  {
    city: 'Buyant',
    lat: '47.1833',
    lng: '97.5500',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Delgermurun',
    lat: '46.5167',
    lng: '98.3500',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Saynshand',
    lat: '43.6167',
    lng: '102.5333',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Sharhulsan',
    lat: '44.6500',
    lng: '104.0500',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Sayn-Ust',
    lat: '47.3500',
    lng: '94.5500',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Bulag',
    lat: '48.2000',
    lng: '108.4833',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'Suugant',
    lat: '45.5333',
    lng: '107.0500',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Doloon',
    lat: '44.4333',
    lng: '105.3333',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Bor-udzuur',
    lat: '45.8000',
    lng: '92.2833',
    province: 'hovd'
  },
  {
    city: 'bulgan',
    lat: '50.5419',
    lng: '101.5142',
    province: 'khuvsgul',
    label: 'Хөвсгөл'
  },
  {
    city: 'Hulstay',
    lat: '48.4333',
    lng: '114.8667',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'uguumur',
    lat: '43.7861',
    lng: '104.4961',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Sumiin Bulag',
    lat: '49.1333',
    lng: '114.8833',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Urt',
    lat: '43.2500',
    lng: '101.0833',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Ergel',
    lat: '43.1500',
    lng: '109.1333',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Ereentsav',
    lat: '49.8833',
    lng: '115.7167',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Senj',
    lat: '44.7167',
    lng: '110.7667',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'khuvsgul',
    lat: '43.6064',
    lng: '109.6381',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Buga',
    lat: '47.7000',
    lng: '94.8667',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Bayangol',
    lat: '45.5491',
    lng: '94.3676',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Dalay',
    lat: '43.4900',
    lng: '103.5244',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Dzogsool',
    lat: '46.8000',
    lng: '107.1500',
    province: 'tuv',
    label: 'Төв'
  },
  {
    city: 'uydzin',
    lat: '44.0833',
    lng: '106.8333',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Ulaandel',
    lat: '46.3667',
    lng: '113.6000',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Nuga',
    lat: '48.3167',
    lng: '95.1167',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Haraat',
    lat: '46.4167',
    lng: '107.6500',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Sangiin Dalay',
    lat: '42.8333',
    lng: '105.1333',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'undurhushuu',
    lat: '48.0000',
    lng: '113.9333',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Hungii',
    lat: '48.5000',
    lng: '94.2833',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Ulaanjirem',
    lat: '45.0500',
    lng: '105.5667',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Altan',
    lat: '48.1167',
    lng: '95.7167',
    province: 'zavkhan',
    label: 'Завхан'
  },
  {
    city: 'Hatansuudal',
    lat: '44.5500',
    lng: '100.8333',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Erdenetsogt',
    lat: '42.9742',
    lng: '106.1269',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'Tahilt',
    lat: '45.3333',
    lng: '96.6500',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Haylaastay',
    lat: '46.7708',
    lng: '113.8825',
    province: 'sukhbaatar',
    label: 'Сүхбаатар'
  },
  {
    city: 'Chandmani',
    lat: '45.5333',
    lng: '110.4667',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Dzalaa',
    lat: '44.5333',
    lng: '99.2667',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Tuhum',
    lat: '44.4000',
    lng: '108.2500',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Tsoohor',
    lat: '43.3128',
    lng: '104.0844',
    province: 'umnugovi',
    label: 'Өмнөговь'
  },
  {
    city: 'uldziit',
    lat: '44.6833',
    lng: '109.0167',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Dzuunbulag',
    lat: '47.1500',
    lng: '115.5333',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Bayan-Ovoo',
    lat: '44.6167',
    lng: '94.9167',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'bulgan',
    lat: '44.7833',
    lng: '98.6500',
    province: 'bayankhongor',
    label: 'Баянхонгор'
  },
  {
    city: 'Rashaant',
    lat: '45.3000',
    lng: '106.2000',
    province: 'dundgovi',
    label: 'Дундговь'
  },
  {
    city: 'Sumber',
    lat: '47.6586',
    lng: '118.5101',
    province: 'dornod',
    label: 'Дорнод'
  },
  {
    city: 'Sangiin Dalay',
    lat: '45.1333',
    lng: '97.7500',
    province: 'govi-altai',
    label: 'Говь-Алтай'
  },
  {
    city: 'Nuden',
    lat: '43.5833',
    lng: '110.4667',
    province: 'dornogovi',
    label: 'Дорноговь'
  },
  {
    city: 'Huvuun',
    lat: '43.1736',
    lng: '102.1319',
    province: 'umnugovi',
    label: 'Өмнөговь'
  }
];
