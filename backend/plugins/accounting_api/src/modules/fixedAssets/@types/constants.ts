export const FIXED_ASSET_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

export const FIXED_ASSET_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

export const FXA_OWNER_RECORD_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALL: ['active', 'inactive'],
};

export const FXA_OWNER_RECORD_ACTIONS = {
  // Эд хариуцагч хөрөнгө хүлээж авсан буюу тоог нэмэгдүүлэх мөр
  RECEIVED: 'received',
  // Эд хариуцагч хөрөнгө хүлээлгэж өгсөн буюу тоог хасах мөр
  HANDED_OVER: 'handedOver',
  ALL: ['received', 'handedOver'],
};

export const FXA_LOG_EVENT_TYPES = {
  // Үндсэн хөрөнгийг анх орлогодож, эд хариуцагчийн бүртгэл үүсгэсэн үйл явдал
  ACQUISITION: 'acquisition',
  // Салбар, хэлтэс, байршил зэрэг ашиглалтын нэгж хооронд шилжүүлсэн үйл явдал
  MOVE: 'move',
  // Зөвхөн эд хариуцагч өөрчилсөн үйл явдал
  RESPONSIBLE: 'responsible',
  // Эд хариуцагчийн бүртгэлд холбогдох элэгдлийн үйл явдал
  DEPRECIATION: 'depreciation',
  // Үндсэн хөрөнгийг ашиглалтаас гаргаж, данснаас хассан үйл явдал
  DISPOSAL: 'disposal',
  // Үндсэн хөрөнгийг борлуулсан үйл явдал
  SALE: 'sale',
  // Үндсэн хөрөнгийн өртөг, дансны үнийг дахин үнэлсэн үйл явдал
  REVALUATION: 'revaluation',
  // Анхны өртөг, үлдэх өртөг, ашиглах хугацаа зэрэг тохиргоог залруулсан үйл явдал
  ADJUSTMENT: 'adjustment',
  ALL: [
    'acquisition',
    'move',
    'responsible',
    'depreciation',
    'disposal',
    'sale',
    'revaluation',
    'adjustment',
  ],
};

export const FIXED_ASSET_DEPRECIATION_METHODS = {
  STRAIGHT_LINE: 'straightLine',
  SUM_OF_YEARS_DIGITS: 'sumOfYearsDigits',
  DOUBLE_DECLINING_BALANCE: 'doubleDecliningBalance',
  DECLINING_BALANCE: 'decliningBalance',
  MANUAL: 'manual',
  ALL: [
    'straightLine',
    'sumOfYearsDigits',
    'doubleDecliningBalance',
    'decliningBalance',
    'manual',
  ],
};
