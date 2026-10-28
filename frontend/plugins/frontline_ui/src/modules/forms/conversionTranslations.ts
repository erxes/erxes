import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

const en = {
  convert: 'Convert field',
  basic: 'Basic: {{type}}',
  customer: 'Customer: {{type}}',
  text: 'Text',
  textarea: 'Long text',
  number: 'Number',
  date: 'Date',
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  description: 'Description',
  email: 'Email',
  phone: 'Phone',
  birthDate: 'Birth date',
  help: 'Saved answers stay in this field. They must match the new type and validation rule. Existing customer profiles are not changed.',
  checking: 'Checking saved answers…',
  checkingHelp:
    'Large forms may take a few seconds. You can keep editing or cancel.',
  compatible:
    'All {{count}} saved answers are compatible. They will be checked again when you save.',
  empty: 'No saved answers to check. The new type will apply when you save.',
  incompatible:
    '{{invalid}} of {{total}} saved answers do not match the new type or validation rule.',
  blockedHelp:
    'Review the answers or choose another type. No answers have been changed.',
  review: 'Review incompatible answers',
  reviewHelp:
    'Scroll to see more answers, or search for a value. Open a submission to see the full answer.',
  search: 'Search answers',
  searchAction: 'Search',
  found: '{{count}} incompatible answers found',
  noMatches: 'No incompatible answers match your search.',
  answer: 'Answer',
  reason: 'Reason',
  typeMismatch: 'Does not match the field type',
  ruleMismatch: 'Does not match the validation rule',
  viewSubmission: 'View submission',
  loadingMore: 'Loading more answers…',
  loadMoreFailed:
    'Could not load more answers. Your loaded answers are still here.',
  allLoaded: 'All matching answers loaded',
  close: 'Close',
  retry: 'Try again',
  unavailable:
    'Could not check saved answers. Try again before confirming the conversion.',
  timeout:
    'The check exceeded its time limit. No fields were changed. Simplify a custom rule or try again when the server is less busy.',
  invalidValidator:
    'The validation pattern is invalid or too long. Update it before converting.',
  stale:
    'This field changed since you opened the form. Reopen the form before converting it.',
  missing:
    'This field no longer exists. Reopen the form to load the latest fields.',
  unsupported:
    'These field types cannot be converted without changing the saved answers.',
  linked: 'Linked custom fields cannot be converted.',
  duplicate:
    'This customer field is already used in the form. Choose another field.',
  logics:
    'Update the conditional rules that use this field before converting it.',
  changedAnswers:
    'Saved answers for “{{fieldName}}” are incompatible. Return to the field editor to review them. No fields were changed.',
  transactionsRequired:
    'Field conversion is not available on this database setup. Ask your administrator to enable MongoDB transactions. Your draft has been kept.',
  formChanged:
    'The form changed or is receiving submissions. Try saving again. Your draft has been kept and no changes were saved.',
};

const mn: Record<keyof typeof en, string> = {
  transactionsRequired:
    'Энэ өгөгдлийн сангийн тохиргоонд талбар хөрвүүлэх боломжгүй. Админаас MongoDB transaction идэвхжүүлэхийг хүснэ үү. Таны засвар хадгалагдаж үлдсэн.',
  formChanged:
    'Маягт өөрчлөгдсөн эсвэл шинэ хариулт хүлээн авч байна. Дахин хадгална уу. Таны засвар үлдсэн бөгөөд өөрчлөлт хадгалагдаагүй.',
  convert: 'Талбар хөрвүүлэх',
  basic: 'Энгийн: {{type}}',
  customer: 'Харилцагчийн: {{type}}',
  text: 'Текст',
  textarea: 'Урт текст',
  number: 'Тоо',
  date: 'Огноо',
  firstName: 'Нэр',
  middleName: 'Ургийн овог',
  lastName: 'Овог',
  description: 'Тайлбар',
  email: 'Имэйл',
  phone: 'Утас',
  birthDate: 'Төрсөн огноо',
  help: 'Өмнөх хариултууд энэ талбарт хадгалагдана. Шинэ төрөл болон шалгах дүрэмд нийцсэн байх ёстой. Харилцагчдын одоогийн мэдээлэл өөрчлөгдөхгүй.',
  checking: 'Хадгалсан хариултуудыг шалгаж байна…',
  checkingHelp:
    'Олон хариулттай бол хэдэн секунд шаардагдаж болно. Та үргэлжлүүлэн засах эсвэл цуцлах боломжтой.',
  compatible:
    'Хадгалсан {{count}} хариулт бүгд нийцэж байна. Хадгалах үед дахин шалгана.',
  empty: 'Шалгах хадгалсан хариулт байхгүй. Хадгалах үед шинэ төрөл үйлчилнэ.',
  incompatible:
    'Хадгалсан {{total}} хариултаас {{invalid}} нь шинэ төрөл эсвэл шалгах дүрэмд нийцэхгүй байна.',
  blockedHelp:
    'Хариултуудыг шалгах эсвэл өөр төрөл сонгоно уу. Хариултууд өөрчлөгдөөгүй.',
  review: 'Нийцэхгүй хариултуудыг харах',
  reviewHelp:
    'Доош гүйлгэж бусад хариултыг харах эсвэл утгаар нь хайна уу. Бүтэн хариултыг илгээлтээс харна уу.',
  search: 'Хариулт хайх',
  searchAction: 'Хайх',
  found: 'Нийцэхгүй {{count}} хариулт олдлоо',
  noMatches: 'Хайлтад тохирох нийцэхгүй хариулт олдсонгүй.',
  answer: 'Хариулт',
  reason: 'Шалтгаан',
  typeMismatch: 'Талбарын төрөлд нийцэхгүй',
  ruleMismatch: 'Шалгах дүрэмд нийцэхгүй',
  viewSubmission: 'Илгээлтийг харах',
  loadingMore: 'Дараагийн хариултуудыг ачаалж байна…',
  loadMoreFailed:
    'Дараагийн хариултуудыг ачаалж чадсангүй. Өмнө ачаалсан хариултууд хэвээр байна.',
  allLoaded: 'Тохирох бүх хариултыг ачааллаа',
  close: 'Хаах',
  retry: 'Дахин оролдох',
  unavailable:
    'Хадгалсан хариултуудыг шалгаж чадсангүй. Хөрвүүлэлтийг батлахын өмнө дахин оролдоно уу.',
  timeout:
    'Шалгалтын хугацаа хэтэрлээ. Талбарууд өөрчлөгдөөгүй. Өөрийн шалгах дүрмийг хялбарчлах эсвэл серверийн ачаалал багасах үед дахин оролдоно уу.',
  invalidValidator:
    'Шалгах хэв загвар буруу эсвэл хэт урт байна. Хөрвүүлэхийн өмнө засна уу.',
  stale:
    'Маягтыг нээснээс хойш энэ талбар өөрчлөгдсөн байна. Хөрвүүлэхийн өмнө маягтыг дахин нээнэ үү.',
  missing:
    'Энэ талбар устсан байна. Шинэ мэдээллийг авахын тулд маягтыг дахин нээнэ үү.',
  unsupported:
    'Эдгээр төрлийг хадгалсан хариултуудыг өөрчлөхгүйгээр хөрвүүлэх боломжгүй.',
  linked: 'Холбосон тусгай талбарыг хөрвүүлэх боломжгүй.',
  duplicate:
    'Энэ харилцагчийн талбарыг маягтад ашигласан байна. Өөр талбар сонгоно уу.',
  logics:
    'Хөрвүүлэхийн өмнө энэ талбарыг ашигладаг нөхцөлт дүрмүүдийг шинэчилнэ үү.',
  changedAnswers:
    '“{{fieldName}}” талбарын хадгалсан хариултууд нийцэхгүй байна. Талбарын тохиргоонд буцаж хариултуудыг шалгана уу. Талбарууд өөрчлөгдөөгүй.',
};

const errorKeys: Record<string, keyof typeof en> = {
  TRANSACTIONS_REQUIRED: 'transactionsRequired',
  FORM_CHANGED: 'formChanged',
  VALIDATION_TIMEOUT: 'timeout',
  INVALID_VALIDATOR: 'invalidValidator',
  STALE_FIELD: 'stale',
  FIELD_NOT_FOUND: 'missing',
  UNSUPPORTED_TYPE: 'unsupported',
  LINKED_FIELD: 'linked',
  DUPLICATE_MAPPING: 'duplicate',
  CONDITIONAL_RULES: 'logics',
  INCOMPATIBLE_ANSWERS: 'changedAnswers',
};

const typeKeys: Record<string, keyof typeof en> = {
  text: 'text',
  input: 'text',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  'core:customer:firstName': 'firstName',
  'core:customer:middleName': 'middleName',
  'core:customer:lastName': 'lastName',
  'core:customer:description': 'description',
  'core:customer:email': 'email',
  'core:customer:phone': 'phone',
  'core:customer:birthDate': 'birthDate',
};

export const useFormConversionTranslation = () => {
  const { i18n } = useTranslation();
  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-form-conversion')) {
      i18n.addResourceBundle(language, 'frontline-form-conversion', resources);
    }
  }
  const t = (
    key: keyof typeof en,
    values: Record<string, string | number> = {},
  ): string =>
    i18n.t(key, {
      ...values,
      ns: 'frontline-form-conversion',
      defaultValue: en[key],
    });
  return {
    t,
    fieldType: (type: string): string =>
      t(type.startsWith('core:customer:') ? 'customer' : 'basic', {
        type: typeKeys[type] ? t(typeKeys[type]) : type,
      }),
    errorMessage: (error: unknown): string | undefined => {
      if (!(error instanceof ApolloError)) return undefined;
      const details = error.graphQLErrors.find(
        (item) => item.extensions?.code === 'FORM_FIELD_CONVERSION',
      )?.extensions;
      if (!details) return undefined;
      const reason = typeof details.reason === 'string' ? details.reason : '';
      return t(errorKeys[reason] ?? 'unavailable', {
        fieldName:
          typeof details.fieldName === 'string' ? details.fieldName : '',
      });
    },
  };
};
