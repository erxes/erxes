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

export const FXA_INSTANCE_STATUSES = {
  ACTIVE: 'active',
  DISPOSED: 'disposed',
  SOLD: 'sold',
  INACTIVE: 'inactive',
  ALL: ['active', 'disposed', 'sold', 'inactive'],
};

export const FXA_LOG_EVENT_TYPES = {
  // Үндсэн хөрөнгийг анх орлогодож, instance үүсгэсэн үйл явдал
  ACQUISITION: 'acquisition',
  // Салбар, хэлтэс, байршил зэрэг ашиглалтын нэгж хооронд шилжүүлсэн үйл явдал
  MOVE: 'move',
  // Зөвхөн эд хариуцагч өөрчилсөн үйл явдал
  RESPONSIBLE: 'responsible',
  // Тухайн instance-д элэгдэл бодсон үйл явдал
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
  DECLINING_BALANCE: 'decliningBalance',
  MANUAL: 'manual',
  ALL: ['straightLine', 'decliningBalance', 'manual'],
};
