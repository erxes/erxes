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
  { name: 'Говьсүмбэр', capital: 'Чойр', value: 'govisumber' },
  { name: 'Дархан-Уул', capital: 'Дархан', value: 'darkhan' },
  { name: 'Дорноговь', capital: 'Сайншанд', value: 'dornogovi' },
  { name: 'Дорнод', capital: 'Чойбалсан', value: 'dornod' },
  { name: 'Дундговь', capital: 'Мандалговь', value: 'dundgovi' },
  { name: 'Завхан', capital: 'Улиастай', value: 'zavkhan' },
  { name: 'Орхон', capital: 'Эрдэнэт', value: 'erdenet' },
  { name: 'Өвөрхангай	', capital: 'Арвайхээр', value: 'uvurkhangai' },
  { name: 'Өмнөговь', capital: 'Даланзадгад', value: 'umnugovi' },
  { name: 'Сүхбаатар', capital: 'Баруун-Урт', value: 'sukhbaatar' },
  { name: 'Сэлэнгэ', capital: 'Сүхбаатар', value: 'selenge' },
  { name: 'Төв', capital: 'Зуунмод', value: 'tuv' },
  { name: 'Увс', capital: 'Улаангом', value: 'uvs' },
  { name: 'Ховд', capital: 'Ховд', value: 'khovd' },
  { name: 'Хөвсгөл', capital: 'Мөрөн', value: 'khuvsgul' },
  { name: 'Хэнтий', capital: 'Чингис', value: 'khentii' }
];

export const TRIP_STATUSES = {
  START: 'start',
  READY: 'ready'
};
