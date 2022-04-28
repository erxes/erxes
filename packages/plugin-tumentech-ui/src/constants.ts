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
