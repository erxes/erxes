import { IDataModelTemplate } from './templates';

/** Text in both supported languages; packs are applied in the user's one. */
type Text = { en: string; mn: string };

interface IPackField {
  recordType: string;
  key: string;
  label: Text;
  type: string;
  options?: { value: string; label: Text; color?: string }[];
  settings?: Record<string, unknown>;
}

export interface ITemplatePack {
  id: string;
  name: Text;
  description: Text;
  icon: string;
  objects: { key: string; singular: Text; plural: Text; icon: string }[];
  fields: IPackField[];
  relations: {
    recordType: string;
    key: string;
    label: Text;
    targetRecordType: string;
    kind: string;
    inverseKey: string;
    inverseLabel: Text;
  }[];
}

const option = (value: string, en: string, mn: string, color?: string) => ({
  value,
  label: { en, mn },
  ...(color ? { color } : {}),
});

export const TEMPLATE_PACKS: ITemplatePack[] = [
  {
    id: 'real-estate',
    name: { en: 'Real estate', mn: 'Үл хөдлөх хөрөнгө' },
    description: {
      en: 'Properties with price, area and status, and viewings booked by customers.',
      mn: 'Үнэ, талбай, төлөвтэй үл хөдлөх хөрөнгө, харилцагчийн захиалсан үзлэгүүд.',
    },
    icon: 'home',
    objects: [
      { key: 'property', singular: { en: 'Property', mn: 'Үл хөдлөх' }, plural: { en: 'Properties', mn: 'Үл хөдлөхүүд' }, icon: 'home' },
      { key: 'viewing', singular: { en: 'Viewing', mn: 'Үзлэг' }, plural: { en: 'Viewings', mn: 'Үзлэгүүд' }, icon: 'calendar' },
    ],
    fields: [
      { recordType: 'custom:property', key: 'price', label: { en: 'Price', mn: 'Үнэ' }, type: 'currency', settings: { currency: 'MNT', precision: 0, required: true } },
      { recordType: 'custom:property', key: 'kind', label: { en: 'Type', mn: 'Төрөл' }, type: 'select', options: [option('apartment', 'Apartment', 'Орон сууц', 'blue'), option('house', 'House', 'Хувийн сууц', 'green'), option('office', 'Office', 'Оффис', 'purple'), option('land', 'Land', 'Газар', 'orange')] },
      { recordType: 'custom:property', key: 'status', label: { en: 'Status', mn: 'Төлөв' }, type: 'select', options: [option('available', 'Available', 'Боломжтой', 'green'), option('reserved', 'Reserved', 'Захиалсан', 'yellow'), option('sold', 'Sold', 'Зарагдсан', 'gray')], settings: { defaultValue: 'available' } },
      { recordType: 'custom:property', key: 'area', label: { en: 'Area (m²)', mn: 'Талбай (м²)' }, type: 'number', settings: { min: 0, precision: 1 } },
      { recordType: 'custom:property', key: 'rooms', label: { en: 'Rooms', mn: 'Өрөө' }, type: 'number', settings: { min: 0, precision: 0 } },
      { recordType: 'custom:property', key: 'location', label: { en: 'Address', mn: 'Хаяг' }, type: 'address' },
      { recordType: 'custom:property', key: 'agent', label: { en: 'Agent', mn: 'Агент' }, type: 'member' },
      { recordType: 'custom:property', key: 'pricePerSqm', label: { en: 'Price per m²', mn: 'м² үнэ' }, type: 'formula', settings: { expression: 'ROUND({price} / {area})', resultType: 'number' } },
      { recordType: 'custom:viewing', key: 'at', label: { en: 'Time', mn: 'Цаг' }, type: 'dateTime', settings: { required: true } },
      { recordType: 'custom:viewing', key: 'outcome', label: { en: 'Outcome', mn: 'Үр дүн' }, type: 'select', options: [option('planned', 'Planned', 'Төлөвлөсөн', 'gray'), option('interested', 'Interested', 'Сонирхсон', 'green'), option('not-interested', 'Not interested', 'Сонирхоогүй', 'red')], settings: { defaultValue: 'planned' } },
    ],
    relations: [
      { recordType: 'custom:viewing', key: 'property', label: { en: 'Property', mn: 'Үл хөдлөх' }, targetRecordType: 'custom:property', kind: 'manyToOne', inverseKey: 'viewings', inverseLabel: { en: 'Viewings', mn: 'Үзлэгүүд' } },
      { recordType: 'custom:viewing', key: 'customer', label: { en: 'Customer', mn: 'Харилцагч' }, targetRecordType: 'core:customer', kind: 'manyToOne', inverseKey: 'viewings', inverseLabel: { en: 'Viewings', mn: 'Үзлэгүүд' } },
    ],
  },
  {
    id: 'clinic',
    name: { en: 'Clinic', mn: 'Эмнэлэг' },
    description: {
      en: 'Patient details on customers, and appointments with a doctor and status.',
      mn: 'Харилцагч дээрх өвчтөний мэдээлэл, эмчтэй цаг захиалга, төлөв.',
    },
    icon: 'heart',
    objects: [
      { key: 'appointment', singular: { en: 'Appointment', mn: 'Цаг' }, plural: { en: 'Appointments', mn: 'Цагууд' }, icon: 'calendar' },
    ],
    fields: [
      { recordType: 'core:customer', key: 'bloodType', label: { en: 'Blood type', mn: 'Цусны бүлэг' }, type: 'select', options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((value) => option(value, value, value)) },
      { recordType: 'core:customer', key: 'allergies', label: { en: 'Allergies', mn: 'Харшил' }, type: 'longText', settings: { access: 'managers' } },
      { recordType: 'core:customer', key: 'registerNo', label: { en: 'Register no.', mn: 'Регистрийн дугаар' }, type: 'text', settings: { unique: true, maxLength: 10 } },
      { recordType: 'custom:appointment', key: 'at', label: { en: 'Time', mn: 'Цаг' }, type: 'dateTime', settings: { required: true } },
      { recordType: 'custom:appointment', key: 'doctor', label: { en: 'Doctor', mn: 'Эмч' }, type: 'member', settings: { required: true } },
      { recordType: 'custom:appointment', key: 'status', label: { en: 'Status', mn: 'Төлөв' }, type: 'select', options: [option('booked', 'Booked', 'Захиалсан', 'blue'), option('arrived', 'Arrived', 'Ирсэн', 'yellow'), option('done', 'Done', 'Дууссан', 'green'), option('missed', 'Missed', 'Ирээгүй', 'red')], settings: { defaultValue: 'booked' } },
      { recordType: 'custom:appointment', key: 'fee', label: { en: 'Fee', mn: 'Төлбөр' }, type: 'currency', settings: { currency: 'MNT', precision: 0 } },
    ],
    relations: [
      { recordType: 'custom:appointment', key: 'patient', label: { en: 'Patient', mn: 'Өвчтөн' }, targetRecordType: 'core:customer', kind: 'manyToOne', inverseKey: 'appointments', inverseLabel: { en: 'Appointments', mn: 'Цагууд' } },
    ],
  },
  {
    id: 'school',
    name: { en: 'School', mn: 'Сургууль' },
    description: {
      en: 'Courses with tuition and enrolled students, with a seat count per course.',
      mn: 'Төлбөртэй хичээлүүд, элссэн суралцагчид, хичээл бүрийн суудлын тоо.',
    },
    icon: 'school',
    objects: [
      { key: 'course', singular: { en: 'Course', mn: 'Хичээл' }, plural: { en: 'Courses', mn: 'Хичээлүүд' }, icon: 'school' },
    ],
    fields: [
      { recordType: 'custom:course', key: 'tuition', label: { en: 'Tuition', mn: 'Сургалтын төлбөр' }, type: 'currency', settings: { currency: 'MNT', precision: 0 } },
      { recordType: 'custom:course', key: 'startsOn', label: { en: 'Starts', mn: 'Эхлэх' }, type: 'date' },
      { recordType: 'custom:course', key: 'seats', label: { en: 'Seats', mn: 'Суудал' }, type: 'number', settings: { min: 0, precision: 0 } },
      { recordType: 'custom:course', key: 'teacher', label: { en: 'Teacher', mn: 'Багш' }, type: 'member' },
      { recordType: 'custom:course', key: 'enrolledCount', label: { en: 'Enrolled', mn: 'Элссэн' }, type: 'rollup', settings: { rollup: { relation: 'students', op: 'count' } } },
    ],
    relations: [
      { recordType: 'custom:course', key: 'students', label: { en: 'Students', mn: 'Суралцагчид' }, targetRecordType: 'core:customer', kind: 'manyToMany', inverseKey: 'courses', inverseLabel: { en: 'Courses', mn: 'Хичээлүүд' } },
    ],
  },
];

/** A pack as a template in one language. */
export const packTemplate = (pack: ITemplatePack, language: string): IDataModelTemplate => {
  const lang: keyof Text = language.startsWith('mn') ? 'mn' : 'en';

  return {
    version: 1,
    name: pack.name[lang],
    objects: pack.objects.map((object) => ({
      key: object.key,
      singularLabel: object.singular[lang],
      pluralLabel: object.plural[lang],
      icon: object.icon,
    })),
    fields: pack.fields.map((field) => ({
      recordType: field.recordType,
      key: field.key,
      label: field.label[lang],
      type: field.type,
      ...(field.options
        ? {
            options: field.options.map((item) => ({
              value: item.value,
              label: item.label[lang],
              ...(item.color ? { color: item.color as never } : {}),
            })),
          }
        : {}),
      ...(field.settings ? { settings: field.settings } : {}),
    })),
    relations: pack.relations.map((relation) => ({
      ...relation,
      label: relation.label[lang],
      inverseLabel: relation.inverseLabel[lang],
    })),
  };
};
