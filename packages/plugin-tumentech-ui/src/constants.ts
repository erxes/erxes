export const ROAD_CONDITIONS = {
  asphalt: 'засмал ',
  unpaved: 'сайжруулсан шороон',
  dirt: 'шороон',
  ALL: [
    { value: 'asphalt', label: 'засмал ' },
    { value: 'unpaved', label: 'сайжруулсан шороон' },
    { value: 'dirt', label: 'шороон' }
  ]
};

export const CAR_INFO = {
  description: 'Description',

  plateNumber: 'Plate number',
  vinNumber: 'Vin number',
  color: 'Color',
  fuelType: 'Fuel type',
  vintageYear: 'Vintage year',
  importYear: 'Import year',

  ALL: [
    { field: 'plateNumber', label: 'Plate number' },
    { field: 'vinNumber', label: 'Vin number' },
    { field: 'color', label: 'Color' },

    { field: 'fuelType', label: 'Fuel type' },
    { field: 'vintageYear', label: 'Vintage year' },
    { field: 'importYear', label: 'Import year' },
    { field: 'description', label: 'Description' }
  ]
};

export const CAR_DATAS = {
  owner: 'Owner',
  category: 'Category',

  ALL: [
    { field: 'owner', label: 'Owner' },
    { field: 'category', label: 'Category' }
  ]
};

export const CAR_FUEL_TYPES = [
  { label: 'Дизель', value: 'Diesel' },
  { label: 'Бензин', value: 'Petrol' },
  { label: 'Газ', value: 'Gas' },
  { label: 'Цахилгаан', value: 'Electric' },
  { label: 'Хосолсон', value: 'FlexiFuel' }
];

export const CAR_GEAR_BOXS = [
  { label: 'Unknown', value: '' },
  { label: 'Automatic', value: 'Automatic' },
  { label: 'Manual', value: 'Manual' },
  { label: 'CVT', value: 'CVT' },
  { label: 'Semi automatic', value: 'SemiAutomatic' }
];

export const CAR_STEERING_WHEEL = [
  { label: 'Зүүн', value: 'left' },
  { label: 'Баруун', value: 'right' }
];

export const OWNER_TYPES = [
  { label: 'Өөрийн', value: 'Own' },
  { label: 'Банк бус', value: 'NonBank' },
  { label: 'Банк', value: 'Bank' },
  { label: 'Компани', value: 'Company' },
  { label: 'Бусдын эзэмшил', value: 'OwnershipOfOthers' }
];

export const MANUFACTURE_TYPES = [
  { label: 'Хятад', value: 'China' },
  { label: 'Япон', value: 'Japan' },
  { label: 'Солонгос', value: 'Korea' },
  { label: 'Орос', value: 'Russia' },
  { label: 'Америк', value: 'USA' },
  { label: 'Герман', value: 'Germany' },
  { label: 'Чех', value: 'Czech' },
  { label: 'Швед', value: 'Sweden' }
];

export const DRIVING_CLASSIFICATION = [
  { label: 'A', value: 'ClassA' },
  { label: 'B', value: 'ClassB' },
  { label: 'C', value: 'ClassC' },
  { label: 'D', value: 'ClassD' },
  { label: 'E', value: 'ClassE' },
  { label: 'M', value: 'ClassM' }
];

export const REPAIR_SERVICE_TYPES = [
  { label: 'Өөрөө', value: 'Himself' },
  { label: 'Засварын төвөөр', value: 'RepairCenter' }
];

export const TRANSMISSION_TYPES = [
  { label: 'Механик', value: 'Mechanic' },
  { label: 'Автомат', value: 'Automatic' },
  { label: 'Хосолсон', value: 'Combined' }
];

export const ENGINE_CHANGE = [
  { label: 'Тийм', value: 'Yes' },
  { label: 'Үгүй', value: 'No' }
];

export const LIFT_CHANGE = [
  { label: 'Тийм', value: 'Yes' },
  { label: 'Үгүй', value: 'No' }
];

export const TRAILER_TYPES = [
  {
    label: 'Прохов',
    value: 'Prokhov'
  },
  {
    label: 'Эмээл',
    value: 'Emeel'
  },
  {
    label: 'Хамааралгүй',
    value: 'DoesNotMatter'
  }
];

export const GENERAL_CLASSIFICATION_TYPES = [
  {
    label: 'Авто Угсраа /энгийн/',
    value: 'AutoAssemblySimple',
    options: [
      {
        label: '123',
        value: '123'
      }
    ]
  },
  {
    label: 'Авто Угсраа /тусгай/',
    value: 'AutoAssemblySpecial',
    options: [{ value: 'hello', label: 'hello' }]
  }
];

export const TIRE_LOAD_TYPES = [
  { label: 'Дан', value: 'Only' },
  { label: 'Давхар', value: 'Double' }
];

export const BOW_TYPES = [
  { label: 'Хий', value: 'Gas' },
  { label: 'Төмөр', value: 'Iron' }
];

export const BRAKE_TYPES = [
  { label: 'Тэлдэг', value: 'Expand' },
  { label: 'Хавчдаг', value: 'Clamp' },
  { label: 'Уулын', value: 'Mount' },
  { label: 'Хөдөлгүүрийн', value: 'Engine' }
];

export const FLOOR_TYPE = [
  { label: 'Модон', value: 'Wooden' },
  { label: 'Төмрөн', value: 'Iron' }
];

export const LIFT_TYPE = [
  { label: 'Кран', value: 'Kran' },
  { label: 'Сэрээт ачигч', value: 'Forklift' },
  { label: 'Ковш', value: 'Kovsh' },
  { label: 'Экска', value: 'Exca' }
];

export const DOOR_CHANGE = [
  { label: '2', value: 'Door2' },
  { label: '3', value: 'Door3' },
  { label: '4', value: 'Door4' },
  { label: '5', value: 'Door5' },
  { label: '6', value: 'Door6' },
  { label: '7', value: 'Door7' }
];

export const SEAT_CHANGE = [
  { label: '1', value: 'Seat1' },
  { label: '2', value: 'Seat2' },
  { label: '3', value: 'Seat3' },
  { label: '4', value: 'Seat4' },
  { label: '5', value: 'Seat5' },
  { label: '6', value: 'Seat6' }
];

export const INTERVAL_TYPES = [
  { label: 'м/цаг', value: 'Mh' },
  { label: 'км', value: 'Km' },
  { label: 'улирал', value: 'Season' }
];

export const RUNNING_TYPES = [
  { label: 'км', value: 'Km' },
  { label: 'мото/цаг/', value: 'Moto_h' }
];

export const WAGON_CAPACITY_TYPES = [
  { label: 'тон', value: 'Ton' },
  { label: 'л', value: 'Litre' },
  { label: 'м3', value: 'M3' }
];

export const LIFT_WAGON_CAPACITY_TYPES = [
  { label: 'тон', value: 'Ton' },
  { label: 'л', value: 'Litre' },
  { label: 'м3', value: 'M3' }
];

export const COLLAPSE_CONTENT_SELECTOR = [
  { label: 'Ерөнхий мэдээлэл', value: 'renderMain' },
  { label: 'Техник үзүүлэлт', value: 'renderTechnicalSpecification' },
  { label: 'Тэвшний мэдээлэл', value: 'renderWagonInformation' },
  { label: 'Торхны мэдээлэл', value: 'renderBarrelInformation' },
  { label: 'Тээврийн хэрэгслийн зураг', value: 'renderVehicleImages' },
  { label: 'Зүтгэх хүчний мэдээлэл', value: 'renderForceImformation' }
];

export const CITIES = [
  {
    city: 'Tavanbulag',
    lat: '47.3833',
    lng: '101.8833',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Таванбулаг',
    _id: 'arkhangai_Tavanbulag'
  },
  {
    city: 'Hotont',
    lat: '47.3667',
    lng: '102.4667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Хотонт',
    _id: 'arkhangai_Hotont'
  },
  {
    city: 'Bayantsagaan',
    lat: '48.7317',
    lng: '100.7600',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Баянцагаан',
    _id: 'arkhangai_Bayantsagaan'
  },
  {
    city: 'Hushuut',
    lat: '48.1025',
    lng: '102.5458',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'хөшөөт',
    _id: 'arkhangai_Hushuut'
  },
  {
    city: 'Dzegstey',
    lat: '47.6500',
    lng: '102.5667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Зэгстэй',
    _id: 'arkhangai_Dzegstey'
  },
  {
    city: 'Altan-Ovoo',
    lat: '47.4500',
    lng: '101.7833',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Алтан-Овоо',
    _id: 'arkhangai_Altan-Ovoo'
  },
  {
    city: 'uldziit',
    lat: '48.5356',
    lng: '101.3667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Өлзийт',
    _id: 'arkhangai_uldziit'
  },
  {
    city: 'Hujirt',
    lat: '48.8886',
    lng: '101.2322',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Хужирт',
    _id: 'arkhangai_Hujirt'
  },
  {
    city: 'Uubulan',
    lat: '48.6139',
    lng: '101.9286',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Уубулан',
    _id: 'arkhangai_Uubulan'
  },
  {
    city: 'Bayan',
    lat: '47.4500',
    lng: '103.1500',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Баян',
    _id: 'arkhangai_Bayan'
  },
  {
    city: 'Teel',
    lat: '48.0464',
    lng: '100.5092',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Тээл',
    _id: 'arkhangai_Teel'
  },
  {
    city: 'Horgo',
    lat: '48.1600',
    lng: '99.8756',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Хорго',
    _id: 'arkhangai_Horgo'
  },
  {
    city: 'Jargalant',
    lat: '47.7833',
    lng: '101.9667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Йаргалант',
    _id: 'arkhangai_Jargalant'
  },
  {
    city: 'Dzaanhoshuu',
    lat: '47.5000',
    lng: '100.8667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Дзаанхосхуу',
    _id: 'arkhangai_Dzaanhoshuu'
  },
  {
    city: 'Jargalant',
    lat: '47.5333',
    lng: '100.2167',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Йаргалант',
    _id: 'arkhangai_Jargalant'
  },
  {
    city: 'Bulagiin Denj',
    lat: '47.3167',
    lng: '101.1000',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Булагиин Денй',
    _id: 'arkhangai_Bulagiin Denj'
  },
  {
    city: 'Hunt',
    lat: '47.8667',
    lng: '99.4667',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Хунт',
    _id: 'arkhangai_Hunt'
  },
  {
    city: 'Tsahir',
    lat: '48.0797',
    lng: '98.8517',
    province: 'arkhangai',
    label: 'Архангай',
    city_mn: 'Тсахир',
    _id: 'arkhangai_Tsahir'
  },
  {
    city: 'Bayannuur',
    lat: '48.9333',
    lng: '91.1333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Баяннуур',
    _id: 'bayan-ulgii_Bayannuur'
  },
  {
    city: 'Tsagaannuur',
    lat: '49.5155',
    lng: '89.7431',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Тсагааннуур',
    _id: 'bayan-ulgii_Tsagaannuur'
  },
  {
    city: 'Chihertey',
    lat: '48.3000',
    lng: '89.5000',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Цхихертеы',
    _id: 'bayan-ulgii_Chihertey'
  },
  {
    city: 'Nogoonnuur',
    lat: '49.6000',
    lng: '90.2333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Ногооннуур',
    _id: 'bayan-ulgii_Nogoonnuur'
  },
  {
    city: 'Hushuut',
    lat: '48.9333',
    lng: '89.1333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Хусхуут',
    _id: 'bayan-ulgii_Hushuut'
  },
  {
    city: 'Tsagaantungi',
    lat: '49.0500',
    lng: '90.4500',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Тсагаантунги',
    _id: 'bayan-ulgii_Tsagaantungi'
  },
  {
    city: 'Biluu',
    lat: '49.0333',
    lng: '89.3833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Билуу',
    _id: 'bayan-ulgii_Biluu'
  },
  {
    city: 'Tolbo',
    lat: '48.4167',
    lng: '90.2833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Толбо',
    _id: 'bayan-ulgii_Tolbo'
  },
  {
    city: 'Uujim',
    lat: '48.9000',
    lng: '89.6167',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Ууйим',
    _id: 'bayan-ulgii_Uujim'
  },
  {
    city: 'Rashaant',
    lat: '47.7667',
    lng: '90.8333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Расхаант',
    _id: 'bayan-ulgii_Rashaant'
  },
  {
    city: 'Buyant',
    lat: '48.5667',
    lng: '89.5333',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Буыант',
    _id: 'bayan-ulgii_Buyant'
  },
  {
    city: 'Jargalant',
    lat: '46.9167',
    lng: '91.0833',
    province: 'bayan-ulgii',
    label: 'Баян-Өлгий',
    city_mn: 'Йаргалант',
    _id: 'bayan-ulgii_Jargalant'
  },
  {
    city: 'Dzadgay',
    lat: '46.1833',
    lng: '99.5667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Дзадгаы',
    _id: 'bayankhongor_Dzadgay'
  },
  {
    city: 'Erdenetsogt',
    lat: '46.4167',
    lng: '100.8000',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Ерденетсогт',
    _id: 'bayankhongor_Erdenetsogt'
  },
  {
    city: 'Ulaan-Uul',
    lat: '46.0833',
    lng: '100.8333',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Улаан-Уул',
    _id: 'bayankhongor_Ulaan-Uul'
  },
  {
    city: 'Dzag',
    lat: '46.9333',
    lng: '99.1667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Дзаг',
    _id: 'bayankhongor_Dzag'
  },
  {
    city: 'Bayanhushuu',
    lat: '46.7167',
    lng: '100.1333',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Баянхусхуу',
    _id: 'bayankhongor_Bayanhushuu'
  },
  {
    city: 'Horiult',
    lat: '45.2000',
    lng: '100.7667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Хориулт',
    _id: 'bayankhongor_Horiult'
  },
  {
    city: 'Jargalant',
    lat: '47.1500',
    lng: '99.6333',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Йаргалант',
    _id: 'bayankhongor_Jargalant'
  },
  {
    city: 'Huhburd',
    lat: '46.2667',
    lng: '100.4667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Хухбурд',
    _id: 'bayankhongor_Huhburd'
  },
  {
    city: 'urgun',
    lat: '44.7333',
    lng: '100.3667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'ургун',
    _id: 'bayankhongor_urgun'
  },
  {
    city: 'Bayanbulag',
    lat: '46.8000',
    lng: '98.1000',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Баянбулаг',
    _id: 'bayankhongor_Bayanbulag'
  },
  {
    city: 'Bayanbulag',
    lat: '45.0000',
    lng: '98.9167',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Баянбулаг',
    _id: 'bayankhongor_Bayanbulag'
  },
  {
    city: 'Buyant',
    lat: '46.1500',
    lng: '98.6667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Буыант',
    _id: 'bayankhongor_Buyant'
  },
  {
    city: 'Hoviin Am',
    lat: '47.2667',
    lng: '98.5333',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Ховиин Ам',
    _id: 'bayankhongor_Hoviin Am'
  },
  {
    city: 'Bodi',
    lat: '45.4000',
    lng: '100.5667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Боди',
    _id: 'bayankhongor_Bodi'
  },
  {
    city: 'Bayansayr',
    lat: '45.5500',
    lng: '99.4167',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Баянсаыр',
    _id: 'bayankhongor_Bayansayr'
  },
  {
    city: 'Delgermurun',
    lat: '46.5167',
    lng: '98.3500',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Делгермурун',
    _id: 'bayankhongor_Delgermurun'
  },
  {
    city: 'Hatansuudal',
    lat: '44.5500',
    lng: '100.8333',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Хатансуудал',
    _id: 'bayankhongor_Hatansuudal'
  },
  {
    city: 'Dzalaa',
    lat: '44.5333',
    lng: '99.2667',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'Дзалаа',
    _id: 'bayankhongor_Dzalaa'
  },
  {
    city: 'bulgan',
    lat: '44.7833',
    lng: '98.6500',
    province: 'bayankhongor',
    label: 'Баянхонгор',
    city_mn: 'булган',
    _id: 'bayankhongor_bulgan'
  },
  {
    city: 'Tsul-Ulaan',
    lat: '47.8333',
    lng: '104.5000',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Тсул-Улаан',
    _id: 'bulgan_Tsul-Ulaan'
  },
  {
    city: 'Huremt',
    lat: '48.6631',
    lng: '102.6228',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Хуремт',
    _id: 'bulgan_Huremt'
  },
  {
    city: 'Maanit',
    lat: '48.2967',
    lng: '103.4256',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Маанит',
    _id: 'bulgan_Maanit'
  },
  {
    city: 'Avdzaga',
    lat: '47.6333',
    lng: '103.5167',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Авдзага',
    _id: 'bulgan_Avdzaga'
  },
  {
    city: 'Suuj',
    lat: '47.8500',
    lng: '104.0500',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Сууй',
    _id: 'bulgan_Suuj'
  },
  {
    city: 'Erhet',
    lat: '48.2806',
    lng: '102.9747',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Ерхет',
    _id: 'bulgan_Erhet'
  },
  {
    city: 'Sharga',
    lat: '49.0503',
    lng: '102.0806',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Схарга',
    _id: 'bulgan_Sharga'
  },
  {
    city: 'Darhan',
    lat: '48.2333',
    lng: '103.9500',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Дархан',
    _id: 'bulgan_Darhan'
  },
  {
    city: 'Hutag',
    lat: '49.3950',
    lng: '102.6933',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Хутаг',
    _id: 'bulgan_Hutag'
  },
  {
    city: 'Mandal',
    lat: '48.6311',
    lng: '103.5292',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Мандал',
    _id: 'bulgan_Mandal'
  },
  {
    city: 'Bugat',
    lat: '49.0667',
    lng: '103.6658',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Бугат',
    _id: 'bulgan_Bugat'
  },
  {
    city: 'Ingettolgoi',
    lat: '49.4617',
    lng: '103.9742',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Ингеттолгои',
    _id: 'bulgan_Ingettolgoi'
  },
  {
    city: 'Teshig',
    lat: '49.9553',
    lng: '102.6133',
    province: 'bulgan',
    label: 'Булган',
    city_mn: 'Тесхиг',
    _id: 'bulgan_Teshig'
  },
  {
    city: 'Hongor',
    lat: '49.2301',
    lng: '105.8967',
    province: 'darkhan-uul',
    label: 'Дархан-Уул',
    city_mn: 'Хонгор',
    _id: 'darkhan-uul_Hongor'
  },
  {
    city: 'Sharïngol',
    lat: '49.2560',
    lng: '106.4313',
    province: 'darkhan-uul',
    label: 'Дархан-Уул',
    city_mn: 'Схарïнгол',
    _id: 'darkhan-uul_Sharïngol'
  },
  {
    city: 'orkhon',
    lat: '49.8361',
    lng: '106.1340',
    province: 'darkhan-uul',
    label: 'Дархан-Уул',
    city_mn: 'оркхон',
    _id: 'darkhan-uul_orkhon'
  },
  {
    city: 'Javarthushuu',
    lat: '49.1500',
    lng: '112.7333',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Йавартхусхуу',
    _id: 'dornod_Javarthushuu'
  },
  {
    city: 'Huuvur',
    lat: '48.4000',
    lng: '113.4333',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Хуувур',
    _id: 'dornod_Huuvur'
  },
  {
    city: 'Bayan',
    lat: '47.9167',
    lng: '112.9500',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Баян',
    _id: 'dornod_Bayan'
  },
  {
    city: 'Sergelen',
    lat: '48.5667',
    lng: '114.0833',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Сергелен',
    _id: 'dornod_Sergelen'
  },
  {
    city: 'Naranbulag',
    lat: '49.2333',
    lng: '113.3667',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Наранбулаг',
    _id: 'dornod_Naranbulag'
  },
  {
    city: 'Dashbalbar',
    lat: '49.5333',
    lng: '114.4000',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Дасхбалбар',
    _id: 'dornod_Dashbalbar'
  },
  {
    city: 'Hulstay',
    lat: '48.4333',
    lng: '114.8667',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Хулстаы',
    _id: 'dornod_Hulstay'
  },
  {
    city: 'Sumiin Bulag',
    lat: '49.1333',
    lng: '114.8833',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Сумиин Булаг',
    _id: 'dornod_Sumiin Bulag'
  },
  {
    city: 'Ereentsav',
    lat: '49.8833',
    lng: '115.7167',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Ереентсав',
    _id: 'dornod_Ereentsav'
  },
  {
    city: 'undurhushuu',
    lat: '48.0000',
    lng: '113.9333',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'ундурхусхуу',
    _id: 'dornod_undurhushuu'
  },
  {
    city: 'Dzuunbulag',
    lat: '47.1500',
    lng: '115.5333',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Дзуунбулаг',
    _id: 'dornod_Dzuunbulag'
  },
  {
    city: 'Sumber',
    lat: '47.6586',
    lng: '118.5101',
    province: 'dornod',
    label: 'Дорнод',
    city_mn: 'Сумбер',
    _id: 'dornod_Sumber'
  },
  {
    city: 'Tsomog',
    lat: '45.9167',
    lng: '109.0667',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Тсомог',
    _id: 'dornogovi_Tsomog'
  },
  {
    city: 'Tsagaandurvulj',
    lat: '45.8000',
    lng: '109.3333',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Тсагаандурвулй',
    _id: 'dornogovi_Tsagaandurvulj'
  },
  {
    city: 'Bayan',
    lat: '46.2500',
    lng: '110.1667',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Баян',
    _id: 'dornogovi_Bayan'
  },
  {
    city: 'Hongor',
    lat: '45.8000',
    lng: '111.2000',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Хонгор',
    _id: 'dornogovi_Hongor'
  },
  {
    city: 'Ergel',
    lat: '43.1500',
    lng: '109.1333',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Ергел',
    _id: 'dornogovi_Ergel'
  },
  {
    city: 'Senj',
    lat: '44.7167',
    lng: '110.7667',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Сенй',
    _id: 'dornogovi_Senj'
  },
  {
    city: 'khuvsgul',
    lat: '43.6064',
    lng: '109.6381',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'кхувсгул',
    _id: 'dornogovi_khuvsgul'
  },
  {
    city: 'Chandmani',
    lat: '45.5333',
    lng: '110.4667',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Цхандмани',
    _id: 'dornogovi_Chandmani'
  },
  {
    city: 'Tuhum',
    lat: '44.4000',
    lng: '108.2500',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Тухум',
    _id: 'dornogovi_Tuhum'
  },
  {
    city: 'uldziit',
    lat: '44.6833',
    lng: '109.0167',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'улдзиит',
    _id: 'dornogovi_uldziit'
  },
  {
    city: 'Nuden',
    lat: '43.5833',
    lng: '110.4667',
    province: 'dornogovi',
    label: 'Дорноговь',
    city_mn: 'Нуден',
    _id: 'dornogovi_Nuden'
  },
  {
    city: 'Tavin',
    lat: '46.4167',
    lng: '105.7833',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Тавин',
    _id: 'dundgovi_Tavin'
  },
  {
    city: 'Sangiin Dalay',
    lat: '46.0000',
    lng: '104.9500',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Сангиин Далаы',
    _id: 'dundgovi_Sangiin Dalay'
  },
  {
    city: 'Amardalay',
    lat: '46.1333',
    lng: '106.3833',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Амардалаы',
    _id: 'dundgovi_Amardalay'
  },
  {
    city: 'Ongi',
    lat: '45.4500',
    lng: '103.9000',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Онги',
    _id: 'dundgovi_Ongi'
  },
  {
    city: 'Tsant',
    lat: '46.1833',
    lng: '106.7167',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Тсант',
    _id: 'dundgovi_Tsant'
  },
  {
    city: 'Hajuu-Us',
    lat: '46.0667',
    lng: '107.5000',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Хайуу-Ус',
    _id: 'dundgovi_Hajuu-Us'
  },
  {
    city: 'Tsagaan-Ovoo',
    lat: '45.5167',
    lng: '105.7500',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Тсагаан-Овоо',
    _id: 'dundgovi_Tsagaan-Ovoo'
  },
  {
    city: 'Hashaat',
    lat: '45.2500',
    lng: '104.8333',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Хасхаат',
    _id: 'dundgovi_Hashaat'
  },
  {
    city: 'Buhut',
    lat: '45.2500',
    lng: '108.2833',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Бухут',
    _id: 'dundgovi_Buhut'
  },
  {
    city: 'Argatay',
    lat: '45.7667',
    lng: '107.9833',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Аргатаы',
    _id: 'dundgovi_Argatay'
  },
  {
    city: 'Suugant',
    lat: '45.5333',
    lng: '107.0500',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Суугант',
    _id: 'dundgovi_Suugant'
  },
  {
    city: 'Haraat',
    lat: '46.4167',
    lng: '107.6500',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Хараат',
    _id: 'dundgovi_Haraat'
  },
  {
    city: 'Ulaanjirem',
    lat: '45.0500',
    lng: '105.5667',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Улаанйирем',
    _id: 'dundgovi_Ulaanjirem'
  },
  {
    city: 'Rashaant',
    lat: '45.3000',
    lng: '106.2000',
    province: 'dundgovi',
    label: 'Дундговь',
    city_mn: 'Расхаант',
    _id: 'dundgovi_Rashaant'
  },
  {
    city: 'Jargalant',
    lat: '45.7000',
    lng: '97.1667',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Йаргалант',
    _id: 'govi-altai_Jargalant'
  },
  {
    city: 'Darvi',
    lat: '46.4500',
    lng: '94.1167',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Дарви',
    _id: 'govi-altai_Darvi'
  },
  {
    city: 'Buyanbat',
    lat: '46.9833',
    lng: '95.9500',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Буыанбат',
    _id: 'govi-altai_Buyanbat'
  },
  {
    city: 'Haliun',
    lat: '45.9333',
    lng: '96.1500',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Халиун',
    _id: 'govi-altai_Haliun'
  },
  {
    city: 'Bayan',
    lat: '46.9833',
    lng: '95.1833',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Баян',
    _id: 'govi-altai_Bayan'
  },
  {
    city: 'Tseel',
    lat: '45.5667',
    lng: '95.8667',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Тсеел',
    _id: 'govi-altai_Tseel'
  },
  {
    city: 'Taygan',
    lat: '46.3500',
    lng: '97.2833',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Таыган',
    _id: 'govi-altai_Taygan'
  },
  {
    city: 'Talshand',
    lat: '45.3333',
    lng: '97.9833',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Талсханд',
    _id: 'govi-altai_Talshand'
  },
  {
    city: 'Tsagaan-Olom',
    lat: '46.7000',
    lng: '96.5000',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Тсагаан-Олом',
    _id: 'govi-altai_Tsagaan-Olom'
  },
  {
    city: 'Tugrug',
    lat: '45.7667',
    lng: '94.9333',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Тугруг',
    _id: 'govi-altai_Tugrug'
  },
  {
    city: 'Sharga',
    lat: '46.2500',
    lng: '95.2667',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Схарга',
    _id: 'govi-altai_Sharga'
  },
  {
    city: 'Dzuyl',
    lat: '46.2667',
    lng: '93.9167',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Дзуыл',
    _id: 'govi-altai_Dzuyl'
  },
  {
    city: 'Sayn-Ust',
    lat: '47.3500',
    lng: '94.5500',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Саын-Уст',
    _id: 'govi-altai_Sayn-Ust'
  },
  {
    city: 'Bayangol',
    lat: '45.5491',
    lng: '94.3676',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Баянгол',
    _id: 'govi-altai_Bayangol'
  },
  {
    city: 'Tahilt',
    lat: '45.3333',
    lng: '96.6500',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Тахилт',
    _id: 'govi-altai_Tahilt'
  },
  {
    city: 'Bayan-Ovoo',
    lat: '44.6167',
    lng: '94.9167',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Баян-Овоо',
    _id: 'govi-altai_Bayan-Ovoo'
  },
  {
    city: 'Sangiin Dalay',
    lat: '45.1333',
    lng: '97.7500',
    province: 'govi-altai',
    label: 'Говь-Алтай',
    city_mn: 'Сангиин Далаы',
    _id: 'govi-altai_Sangiin Dalay'
  },
  {
    city: 'Bayantal',
    lat: '46.5622',
    lng: '108.3044',
    province: 'govisumber',
    label: 'Говьсүмбэр',
    city_mn: 'Баянтал',
    _id: 'govisumber_Bayantal'
  },
  {
    city: 'Altanteel',
    lat: '47.1000',
    lng: '92.8500',
    province: 'hovd',
    city_mn: 'Алтантеел',
    _id: 'hovd_Altanteel'
  },
  {
    city: 'Burenhayrhan',
    lat: '46.0833',
    lng: '91.5667',
    province: 'hovd',
    city_mn: 'Буренхаырхан',
    _id: 'hovd_Burenhayrhan'
  },
  {
    city: 'Bayanhushuu',
    lat: '48.2333',
    lng: '91.9167',
    province: 'hovd',
    city_mn: 'Баянхусхуу',
    _id: 'hovd_Bayanhushuu'
  },
  {
    city: 'Buyant',
    lat: '48.0667',
    lng: '91.8167',
    province: 'hovd',
    city_mn: 'Буыант',
    _id: 'hovd_Buyant'
  },
  {
    city: 'Tsenher',
    lat: '46.9167',
    lng: '92.1167',
    province: 'hovd',
    city_mn: 'Тсенхер',
    _id: 'hovd_Tsenher'
  },
  {
    city: 'Har-Us',
    lat: '48.4833',
    lng: '91.4333',
    province: 'hovd',
    city_mn: 'Хар-Ус',
    _id: 'hovd_Har-Us'
  },
  {
    city: 'Tsetsegnuur',
    lat: '46.6000',
    lng: '93.2667',
    province: 'hovd',
    city_mn: 'Тсетсегнуур',
    _id: 'hovd_Tsetsegnuur'
  },
  {
    city: 'Ulaantolgoi',
    lat: '46.6833',
    lng: '92.7833',
    province: 'hovd',
    city_mn: 'Улаантолгои',
    _id: 'hovd_Ulaantolgoi'
  },
  {
    city: 'Tugrug',
    lat: '47.4167',
    lng: '92.2167',
    province: 'hovd',
    city_mn: 'Тугруг',
    _id: 'hovd_Tugrug'
  },
  {
    city: 'Duut',
    lat: '47.5167',
    lng: '91.6333',
    province: 'hovd',
    city_mn: 'Дуут',
    _id: 'hovd_Duut'
  },
  {
    city: 'Urdgol',
    lat: '47.8333',
    lng: '92.6500',
    province: 'hovd',
    city_mn: 'Урдгол',
    _id: 'hovd_Urdgol'
  },
  {
    city: 'Seer',
    lat: '48.3167',
    lng: '92.6333',
    province: 'hovd',
    city_mn: 'Сеер',
    _id: 'hovd_Seer'
  },
  {
    city: 'uyunch',
    lat: '46.0500',
    lng: '92.0167',
    province: 'hovd',
    city_mn: 'уыунцх',
    _id: 'hovd_uyunch'
  },
  {
    city: 'bulgan',
    lat: '46.9500',
    lng: '93.6333',
    province: 'hovd',
    city_mn: 'булган',
    _id: 'hovd_bulgan'
  },
  {
    city: 'Bor-udzuur',
    lat: '45.8000',
    lng: '92.2833',
    province: 'hovd',
    city_mn: 'Бор-удзуур',
    _id: 'hovd_Bor-udzuur'
  },
  {
    city: 'Darhan',
    lat: '46.6167',
    lng: '109.4167',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Дархан',
    _id: 'khentii_Darhan'
  },
  {
    city: 'Bor-undur',
    lat: '46.2558',
    lng: '109.4250',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Бор-ундур',
    _id: 'khentii_Bor-undur'
  },
  {
    city: 'Dundburd',
    lat: '47.9167',
    lng: '111.5000',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Дундбурд',
    _id: 'khentii_Dundburd'
  },
  {
    city: 'Bayan',
    lat: '48.5500',
    lng: '111.0833',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Баян',
    _id: 'khentii_Bayan'
  },
  {
    city: 'Avraga',
    lat: '47.1833',
    lng: '109.1667',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Аврага',
    _id: 'khentii_Avraga'
  },
  {
    city: 'Onon',
    lat: '48.6167',
    lng: '110.6000',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Онон',
    _id: 'khentii_Onon'
  },
  {
    city: 'Jibhalant',
    lat: '47.7833',
    lng: '112.1167',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Йибхалант',
    _id: 'khentii_Jibhalant'
  },
  {
    city: 'Ulaan-Ereg',
    lat: '46.9000',
    lng: '109.7500',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Улаан-Ерег',
    _id: 'khentii_Ulaan-Ereg'
  },
  {
    city: 'Bayan-Ovoo',
    lat: '49.0167',
    lng: '111.6333',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Баян-Овоо',
    _id: 'khentii_Bayan-Ovoo'
  },
  {
    city: 'Modot',
    lat: '47.7500',
    lng: '109.0500',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Модот',
    _id: 'khentii_Modot'
  },
  {
    city: 'Bayanbulag',
    lat: '47.8667',
    lng: '109.9167',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Баянбулаг',
    _id: 'khentii_Bayanbulag'
  },
  {
    city: 'Uldz',
    lat: '48.6667',
    lng: '111.9833',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Улдз',
    _id: 'khentii_Uldz'
  },
  {
    city: 'Buyant',
    lat: '46.2500',
    lng: '110.8333',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Буыант',
    _id: 'khentii_Buyant'
  },
  {
    city: 'Bayan',
    lat: '47.1667',
    lng: '110.8167',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Баян',
    _id: 'khentii_Bayan'
  },
  {
    city: 'Herlen',
    lat: '47.3000',
    lng: '110.5667',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Херлен',
    _id: 'khentii_Herlen'
  },
  {
    city: 'Eg',
    lat: '48.6833',
    lng: '110.1833',
    province: 'khentii',
    label: 'Хэнтий',
    city_mn: 'Ег',
    _id: 'khentii_Eg'
  },
  {
    city: 'selenge',
    lat: '49.4333',
    lng: '101.4667',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'селенге',
    _id: 'khuvsgul_selenge'
  },
  {
    city: 'Rashaant',
    lat: '49.1267',
    lng: '101.4281',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Расхаант',
    _id: 'khuvsgul_Rashaant'
  },
  {
    city: 'Orgil',
    lat: '48.5872',
    lng: '99.3508',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Оргил',
    _id: 'khuvsgul_Orgil'
  },
  {
    city: 'Tsengel',
    lat: '49.4783',
    lng: '100.8894',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Тсенгел',
    _id: 'khuvsgul_Tsengel'
  },
  {
    city: 'Badrah',
    lat: '49.6183',
    lng: '101.9897',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Бадрах',
    _id: 'khuvsgul_Badrah'
  },
  {
    city: 'Jargalant',
    lat: '49.2667',
    lng: '100.2500',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Йаргалант',
    _id: 'khuvsgul_Jargalant'
  },
  {
    city: 'Ider',
    lat: '48.7728',
    lng: '99.8739',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Идер',
    _id: 'khuvsgul_Ider'
  },
  {
    city: 'Erdenet',
    lat: '48.9528',
    lng: '99.5333',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Ерденет',
    _id: 'khuvsgul_Erdenet'
  },
  {
    city: 'Manhan',
    lat: '50.1214',
    lng: '100.0431',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Манхан',
    _id: 'khuvsgul_Manhan'
  },
  {
    city: 'Bayan',
    lat: '49.4333',
    lng: '99.6000',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Баян',
    _id: 'khuvsgul_Bayan'
  },
  {
    city: 'Bulag',
    lat: '49.8500',
    lng: '100.6167',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Булаг',
    _id: 'khuvsgul_Bulag'
  },
  {
    city: 'Altraga',
    lat: '50.2111',
    lng: '98.9508',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Алтрага',
    _id: 'khuvsgul_Altraga'
  },
  {
    city: 'Sharga',
    lat: '49.8000',
    lng: '98.8000',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Схарга',
    _id: 'khuvsgul_Sharga'
  },
  {
    city: 'Mandal',
    lat: '49.9000',
    lng: '99.4333',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Мандал',
    _id: 'khuvsgul_Mandal'
  },
  {
    city: 'Turt',
    lat: '51.5125',
    lng: '100.6639',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Турт',
    _id: 'khuvsgul_Turt'
  },
  {
    city: 'Huhuu',
    lat: '50.4728',
    lng: '100.9278',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Хухуу',
    _id: 'khuvsgul_Huhuu'
  },
  {
    city: 'Eg-Uur',
    lat: '50.1094',
    lng: '101.5753',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Ег-Уур',
    _id: 'khuvsgul_Eg-Uur'
  },
  {
    city: 'Tsagaannuur',
    lat: '51.3564',
    lng: '99.3444',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Тсагааннуур',
    _id: 'khuvsgul_Tsagaannuur'
  },
  {
    city: 'Dzuulun',
    lat: '51.1125',
    lng: '99.6694',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Дзуулун',
    _id: 'khuvsgul_Dzuulun'
  },
  {
    city: 'Halban',
    lat: '49.5000',
    lng: '97.6000',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Халбан',
    _id: 'khuvsgul_Halban'
  },
  {
    city: 'Tugul',
    lat: '50.6833',
    lng: '99.2333',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'Тугул',
    _id: 'khuvsgul_Tugul'
  },
  {
    city: 'bulgan',
    lat: '50.5419',
    lng: '101.5142',
    province: 'khuvsgul',
    label: 'Хөвсгөл',
    city_mn: 'булган',
    _id: 'khuvsgul_bulgan'
  },
  {
    city: 'Jargalant',
    lat: '50.0675',
    lng: '105.8806',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Йаргалант',
    _id: 'selenge_Jargalant'
  },
  {
    city: 'Altanbulag',
    lat: '50.3071',
    lng: '106.4991',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Алтанбулаг',
    _id: 'selenge_Altanbulag'
  },
  {
    city: 'Jargalant',
    lat: '49.6667',
    lng: '106.3333',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Йаргалант',
    _id: 'selenge_Jargalant'
  },
  {
    city: 'Enhtal',
    lat: '49.2475',
    lng: '105.3736',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Енхтал',
    _id: 'selenge_Enhtal'
  },
  {
    city: 'orkhontuul',
    lat: '48.9497',
    lng: '104.9758',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'оркхонтуул',
    _id: 'selenge_orkhontuul'
  },
  {
    city: 'Huurch',
    lat: '50.1036',
    lng: '105.4200',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Хуурцх',
    _id: 'selenge_Huurch'
  },
  {
    city: 'Burgaltay',
    lat: '49.2786',
    lng: '104.7353',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Бургалтаы',
    _id: 'selenge_Burgaltay'
  },
  {
    city: 'Hushaat',
    lat: '49.5000',
    lng: '105.6167',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Хусхаат',
    _id: 'selenge_Hushaat'
  },
  {
    city: 'Bugant',
    lat: '49.5833',
    lng: '106.8500',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Бугант',
    _id: 'selenge_Bugant'
  },
  {
    city: 'Bulagtay',
    lat: '49.7667',
    lng: '107.5500',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Булагтаы',
    _id: 'selenge_Bulagtay'
  },
  {
    city: 'Dzelter',
    lat: '50.3156',
    lng: '105.0458',
    province: 'selenge',
    label: 'Сэлэнгэ',
    city_mn: 'Дзелтер',
    _id: 'selenge_Dzelter'
  },
  {
    city: 'Hanhuhii',
    lat: '47.6167',
    lng: '112.1333',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Ханхухии',
    _id: 'sukhbaatar_Hanhuhii'
  },
  {
    city: 'Ovoot',
    lat: '45.3000',
    lng: '113.8667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Овоот',
    _id: 'sukhbaatar_Ovoot'
  },
  {
    city: 'Sergelen',
    lat: '46.2000',
    lng: '111.8167',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Сергелен',
    _id: 'sukhbaatar_Sergelen'
  },
  {
    city: 'Bayasgalant',
    lat: '46.9833',
    lng: '112.0500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Баясгалант',
    _id: 'sukhbaatar_Bayasgalant'
  },
  {
    city: 'Shireet',
    lat: '45.7167',
    lng: '112.3500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Схиреет',
    _id: 'sukhbaatar_Shireet'
  },
  {
    city: 'Dzuunbulag',
    lat: '46.3833',
    lng: '112.1833',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Дзуунбулаг',
    _id: 'sukhbaatar_Dzuunbulag'
  },
  {
    city: 'Chonogol',
    lat: '45.9000',
    lng: '115.3667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Цхоногол',
    _id: 'sukhbaatar_Chonogol'
  },
  {
    city: 'Hongor',
    lat: '45.1667',
    lng: '113.6667',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Хонгор',
    _id: 'sukhbaatar_Hongor'
  },
  {
    city: 'Havirga',
    lat: '45.6667',
    lng: '113.0833',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Хавирга',
    _id: 'sukhbaatar_Havirga'
  },
  {
    city: 'Hatavch',
    lat: '46.1667',
    lng: '112.9500',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Хатавцх',
    _id: 'sukhbaatar_Hatavch'
  },
  {
    city: 'Ulaandel',
    lat: '46.3667',
    lng: '113.6000',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Улаандел',
    _id: 'sukhbaatar_Ulaandel'
  },
  {
    city: 'Haylaastay',
    lat: '46.7708',
    lng: '113.8825',
    province: 'sukhbaatar',
    label: 'Сүхбаатар',
    city_mn: 'Хаылаастаы',
    _id: 'sukhbaatar_Haylaastay'
  },
  {
    city: 'Bat-uldziit',
    lat: '48.2111',
    lng: '104.7597',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Бат-улдзиит',
    _id: 'tuv_Bat-uldziit'
  },
  {
    city: 'Ar-Asgat',
    lat: '48.2622',
    lng: '105.4119',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Ар-Асгат',
    _id: 'tuv_Ar-Asgat'
  },
  {
    city: 'Arhust',
    lat: '47.5152',
    lng: '107.9384',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Архуст',
    _id: 'tuv_Arhust'
  },
  {
    city: 'Orgil',
    lat: '48.4167',
    lng: '105.3333',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Оргил',
    _id: 'tuv_Orgil'
  },
  {
    city: 'Dund-Urt',
    lat: '48.0379',
    lng: '105.9219',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Дунд-Урт',
    _id: 'tuv_Dund-Urt'
  },
  {
    city: 'Ulaanhudag',
    lat: '47.3333',
    lng: '104.5000',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Улаанхудаг',
    _id: 'tuv_Ulaanhudag'
  },
  {
    city: 'Ulaanhad',
    lat: '47.9333',
    lng: '105.5500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Улаанхад',
    _id: 'tuv_Ulaanhad'
  },
  {
    city: 'Argalant',
    lat: '47.9333',
    lng: '105.8667',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Аргалант',
    _id: 'tuv_Argalant'
  },
  {
    city: 'Lun',
    lat: '47.8667',
    lng: '105.2500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Лун',
    _id: 'tuv_Lun'
  },
  {
    city: 'Bayandelger',
    lat: '47.7333',
    lng: '108.1167',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Баянделгер',
    _id: 'tuv_Bayandelger'
  },
  {
    city: 'Hushigiin-Ar',
    lat: '47.5572',
    lng: '106.9633',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Хусхигиин-Ар',
    _id: 'tuv_Hushigiin-Ar'
  },
  {
    city: 'Bayantuhum',
    lat: '46.9167',
    lng: '105.0500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Баянтухум',
    _id: 'tuv_Bayantuhum'
  },
  {
    city: 'Maanit',
    lat: '47.2500',
    lng: '107.5333',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Маанит',
    _id: 'tuv_Maanit'
  },
  {
    city: 'Hujirt',
    lat: '46.6000',
    lng: '104.5833',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Хуйирт',
    _id: 'tuv_Hujirt'
  },
  {
    city: 'Bayshint',
    lat: '47.4167',
    lng: '104.8167',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Баысхинт',
    _id: 'tuv_Bayshint'
  },
  {
    city: 'Bayasgalant',
    lat: '47.1833',
    lng: '108.2500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Баясгалант',
    _id: 'tuv_Bayasgalant'
  },
  {
    city: 'Altanbulag',
    lat: '47.7000',
    lng: '106.4000',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Алтанбулаг',
    _id: 'tuv_Altanbulag'
  },
  {
    city: 'Nart',
    lat: '47.7204',
    lng: '107.7956',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Нарт',
    _id: 'tuv_Nart'
  },
  {
    city: 'Bayanbaraat',
    lat: '46.8667',
    lng: '106.2500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Баянбараат',
    _id: 'tuv_Bayanbaraat'
  },
  {
    city: 'Bulag',
    lat: '48.2000',
    lng: '108.4833',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Булаг',
    _id: 'tuv_Bulag'
  },
  {
    city: 'Dzogsool',
    lat: '46.8000',
    lng: '107.1500',
    province: 'tuv',
    label: 'Төв',
    city_mn: 'Дзогсоол',
    _id: 'tuv_Dzogsool'
  },
  {
    city: 'Baruunsuu',
    lat: '43.6972',
    lng: '105.7364',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Баруунсуу',
    _id: 'umnugovi_Baruunsuu'
  },
  {
    city: 'Ihbulag',
    lat: '43.2000',
    lng: '107.2000',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Ихбулаг',
    _id: 'umnugovi_Ihbulag'
  },
  {
    city: 'bulgan',
    lat: '44.1128',
    lng: '103.5425',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'булган',
    _id: 'umnugovi_bulgan'
  },
  {
    city: 'Saynshand',
    lat: '43.6167',
    lng: '102.5333',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Саынсханд',
    _id: 'umnugovi_Saynshand'
  },
  {
    city: 'Sharhulsan',
    lat: '44.6500',
    lng: '104.0500',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Схархулсан',
    _id: 'umnugovi_Sharhulsan'
  },
  {
    city: 'Doloon',
    lat: '44.4333',
    lng: '105.3333',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Долоон',
    _id: 'umnugovi_Doloon'
  },
  {
    city: 'uguumur',
    lat: '43.7861',
    lng: '104.4961',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'угуумур',
    _id: 'umnugovi_uguumur'
  },
  {
    city: 'Urt',
    lat: '43.2500',
    lng: '101.0833',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Урт',
    _id: 'umnugovi_Urt'
  },
  {
    city: 'Dalay',
    lat: '43.4900',
    lng: '103.5244',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Далаы',
    _id: 'umnugovi_Dalay'
  },
  {
    city: 'uydzin',
    lat: '44.0833',
    lng: '106.8333',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'уыдзин',
    _id: 'umnugovi_uydzin'
  },
  {
    city: 'Sangiin Dalay',
    lat: '42.8333',
    lng: '105.1333',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Сангиин Далаы',
    _id: 'umnugovi_Sangiin Dalay'
  },
  {
    city: 'Erdenetsogt',
    lat: '42.9742',
    lng: '106.1269',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Ерденетсогт',
    _id: 'umnugovi_Erdenetsogt'
  },
  {
    city: 'Tsoohor',
    lat: '43.3128',
    lng: '104.0844',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Тсоохор',
    _id: 'umnugovi_Tsoohor'
  },
  {
    city: 'Huvuun',
    lat: '43.1736',
    lng: '102.1319',
    province: 'umnugovi',
    label: 'Өмнөговь',
    city_mn: 'Хувуун',
    _id: 'umnugovi_Huvuun'
  },
  {
    city: 'Huhtolgoi',
    lat: '49.2667',
    lng: '90.9000',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Хухтолгои',
    _id: 'uvs_Huhtolgoi'
  },
  {
    city: 'Tooromt',
    lat: '50.4667',
    lng: '93.5833',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Тооромт',
    _id: 'uvs_Tooromt'
  },
  {
    city: 'Harhiraa',
    lat: '49.7667',
    lng: '91.9000',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Хархираа',
    _id: 'uvs_Harhiraa'
  },
  {
    city: 'Bayshint',
    lat: '49.6667',
    lng: '90.2833',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Баысхинт',
    _id: 'uvs_Bayshint'
  },
  {
    city: 'Namir',
    lat: '49.1000',
    lng: '91.7167',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Намир',
    _id: 'uvs_Namir'
  },
  {
    city: 'Jargalant',
    lat: '49.2667',
    lng: '95.4333',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Йаргалант',
    _id: 'uvs_Jargalant'
  },
  {
    city: 'Havtsal',
    lat: '50.1000',
    lng: '91.6667',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Хавтсал',
    _id: 'uvs_Havtsal'
  },
  {
    city: 'Har-Us',
    lat: '49.0333',
    lng: '92.0333',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Хар-Ус',
    _id: 'uvs_Har-Us'
  },
  {
    city: 'Baruunturuun',
    lat: '49.6500',
    lng: '94.3833',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Баруунтуруун',
    _id: 'uvs_Baruunturuun'
  },
  {
    city: 'Zuunhuvuu',
    lat: '50.6128',
    lng: '92.4022',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Зуунхувуу',
    _id: 'uvs_Zuunhuvuu'
  },
  {
    city: 'Dzel',
    lat: '49.9000',
    lng: '93.7833',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Дзел',
    _id: 'uvs_Dzel'
  },
  {
    city: 'Tsetserleg',
    lat: '49.2667',
    lng: '94.8500',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Тсетсерлег',
    _id: 'uvs_Tsetserleg'
  },
  {
    city: 'Bugat',
    lat: '49.5333',
    lng: '93.8167',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Бугат',
    _id: 'uvs_Bugat'
  },
  {
    city: 'Naranbulag',
    lat: '49.3667',
    lng: '92.5667',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Наранбулаг',
    _id: 'uvs_Naranbulag'
  },
  {
    city: 'Tsalgar',
    lat: '49.7167',
    lng: '93.2667',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Тсалгар',
    _id: 'uvs_Tsalgar'
  },
  {
    city: 'Harmod',
    lat: '50.3333',
    lng: '91.6667',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Хармод',
    _id: 'uvs_Harmod'
  },
  {
    city: 'Munduuhuu',
    lat: '49.4000',
    lng: '94.2333',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Мундуухуу',
    _id: 'uvs_Munduuhuu'
  },
  {
    city: 'Sharbulag',
    lat: '48.8167',
    lng: '93.1000',
    province: 'uvs',
    label: 'Увс',
    city_mn: 'Схарбулаг',
    _id: 'uvs_Sharbulag'
  },
  {
    city: 'uvt',
    lat: '46.8167',
    lng: '102.2500',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'увт',
    _id: 'uvurkhangai_uvt'
  },
  {
    city: 'Mayhan',
    lat: '46.0833',
    lng: '103.8333',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Маыхан',
    _id: 'uvurkhangai_Mayhan'
  },
  {
    city: 'Munhbulag',
    lat: '46.7500',
    lng: '103.5167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Мунхбулаг',
    _id: 'uvurkhangai_Munhbulag'
  },
  {
    city: 'Tsagaan Ovoo',
    lat: '45.9500',
    lng: '101.4833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Тсагаан Овоо',
    _id: 'uvurkhangai_Tsagaan Ovoo'
  },
  {
    city: 'Bayan-Ulaan',
    lat: '46.5167',
    lng: '102.5833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Баян-Улаан',
    _id: 'uvurkhangai_Bayan-Ulaan'
  },
  {
    city: 'Bumbat',
    lat: '46.4667',
    lng: '104.1000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Бумбат',
    _id: 'uvurkhangai_Bumbat'
  },
  {
    city: 'Ongon',
    lat: '46.9667',
    lng: '103.7833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Онгон',
    _id: 'uvurkhangai_Ongon'
  },
  {
    city: 'Shiree',
    lat: '45.8500',
    lng: '103.4000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Схирее',
    _id: 'uvurkhangai_Shiree'
  },
  {
    city: 'Sangiin Dalay',
    lat: '46.6500',
    lng: '103.3167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Сангиин Далаы',
    _id: 'uvurkhangai_Sangiin Dalay'
  },
  {
    city: 'Huremt',
    lat: '46.3000',
    lng: '102.4667',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Хуремт',
    _id: 'uvurkhangai_Huremt'
  },
  {
    city: 'Huuvur',
    lat: '45.1667',
    lng: '101.4000',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Хуувур',
    _id: 'uvurkhangai_Huuvur'
  },
  {
    city: 'Mardzad',
    lat: '45.9500',
    lng: '102.0500',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Мардзад',
    _id: 'uvurkhangai_Mardzad'
  },
  {
    city: 'hovd',
    lat: '44.6667',
    lng: '102.3833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'ховд',
    _id: 'uvurkhangai_hovd'
  },
  {
    city: 'Hoolt',
    lat: '45.5333',
    lng: '102.9833',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Хоолт',
    _id: 'uvurkhangai_Hoolt'
  },
  {
    city: 'Arguut',
    lat: '45.4500',
    lng: '102.4167',
    province: 'uvurkhangai',
    label: 'Өвөрхангай',
    city_mn: 'Аргуут',
    _id: 'uvurkhangai_Arguut'
  },
  {
    city: 'Asgat',
    lat: '49.5108',
    lng: '96.7994',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Асгат',
    _id: 'zavkhan_Asgat'
  },
  {
    city: 'Tosontsengel',
    lat: '48.7567',
    lng: '98.2839',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Тосонтсенгел',
    _id: 'zavkhan_Tosontsengel'
  },
  {
    city: 'Bayan-Uhaa',
    lat: '48.5500',
    lng: '98.6667',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Баян-Ухаа',
    _id: 'zavkhan_Bayan-Uhaa'
  },
  {
    city: 'uvugdii',
    lat: '48.6428',
    lng: '97.6186',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'увугдии',
    _id: 'zavkhan_uvugdii'
  },
  {
    city: 'Holboo',
    lat: '48.5833',
    lng: '95.4500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Холбоо',
    _id: 'zavkhan_Holboo'
  },
  {
    city: 'Tegsh',
    lat: '48.7333',
    lng: '96.0000',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Тегсх',
    _id: 'zavkhan_Tegsh'
  },
  {
    city: 'Balgatay',
    lat: '46.9000',
    lng: '97.1500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Балгатаы',
    _id: 'zavkhan_Balgatay'
  },
  {
    city: 'Altanbulag',
    lat: '49.3000',
    lng: '96.3333',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Алтанбулаг',
    _id: 'zavkhan_Altanbulag'
  },
  {
    city: 'Dzuunmod',
    lat: '48.2125',
    lng: '97.3786',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Дзуунмод',
    _id: 'zavkhan_Dzuunmod'
  },
  {
    city: 'oigon',
    lat: '49.0000',
    lng: '96.5500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'оигон',
    _id: 'zavkhan_oigon'
  },
  {
    city: 'Tsagaanchuluut',
    lat: '47.0833',
    lng: '96.6500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Тсагаанцхулуут',
    _id: 'zavkhan_Tsagaanchuluut'
  },
  {
    city: 'Songino',
    lat: '48.8833',
    lng: '95.8833',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Сонгино',
    _id: 'zavkhan_Songino'
  },
  {
    city: 'Altay',
    lat: '49.6833',
    lng: '96.3333',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Алтаы',
    _id: 'zavkhan_Altay'
  },
  {
    city: 'Aldar',
    lat: '47.7000',
    lng: '96.6000',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Алдар',
    _id: 'zavkhan_Aldar'
  },
  {
    city: 'Shiree',
    lat: '47.5000',
    lng: '96.8500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Схирее',
    _id: 'zavkhan_Shiree'
  },
  {
    city: 'Chandmani',
    lat: '48.0500',
    lng: '96.2500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Цхандмани',
    _id: 'zavkhan_Chandmani'
  },
  {
    city: 'Buyant',
    lat: '47.1833',
    lng: '97.5500',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Буыант',
    _id: 'zavkhan_Buyant'
  },
  {
    city: 'Buga',
    lat: '47.7000',
    lng: '94.8667',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Буга',
    _id: 'zavkhan_Buga'
  },
  {
    city: 'Nuga',
    lat: '48.3167',
    lng: '95.1167',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Нуга',
    _id: 'zavkhan_Nuga'
  },
  {
    city: 'Hungii',
    lat: '48.5000',
    lng: '94.2833',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Хунгии',
    _id: 'zavkhan_Hungii'
  },
  {
    city: 'Altan',
    lat: '48.1167',
    lng: '95.7167',
    province: 'zavkhan',
    label: 'Завхан',
    city_mn: 'Алтан',
    _id: 'zavkhan_Altan'
  }
];
