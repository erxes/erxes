import type { TFunction } from 'i18next';
import { getI18n } from 'react-i18next';

const labels: Record<string, { en: string; mn: string }> = {
  'tax-useful-life-in-years': {
    en: 'Tax useful life (years)',
    mn: 'Татварын ашиглах жил',
  },
  'unit-accumulated-depreciation': {
    en: 'Unit accumulated depreciation',
    mn: 'Нэгжийн хуримтлагдсан элэгдэл',
  },
  'total-accumulated-depreciation': {
    en: 'Total accumulated depreciation',
    mn: 'Нийт хуримтлагдсан элэгдэл',
  },
  'total-residual-value': {
    en: 'Total residual value',
    mn: 'Нийт үлдэх өртөг',
  },
  'tax-unit-accumulated-depreciation': {
    en: 'Tax unit accumulated depreciation',
    mn: 'Татварын нэгжийн хуримтлагдсан элэгдэл',
  },
  'tax-total-accumulated-depreciation': {
    en: 'Tax total accumulated depreciation',
    mn: 'Татварын нийт хуримтлагдсан элэгдэл',
  },
  'tax-total-residual-value': {
    en: 'Tax total residual value',
    mn: 'Татварын нийт үлдэх өртөг',
  },
  'total-unrecovered-revaluation-loss': {
    en: 'Total unrecovered revaluation loss',
    mn: 'Нөхөгдөөгүй үнэлгээний нийт алдагдал',
  },
  'total-revaluation-reserve-balance': {
    en: 'Total revaluation reserve balance',
    mn: 'Дахин үнэлгээний нөөцийн нийт үлдэгдэл',
  },
  'income-tax-rate-missing': {
    en: 'Income tax rate is missing. Run the calculation and enter the rate to calculate tax depreciation and deferred tax.',
    mn: 'Орлогын албан татварын хувь оруулаагүй байна. Ажиллуулах товчоор хувиа оруулж, татварын тооцоог хийнэ.',
  },
  'income-tax-rate-missing-posted': {
    en: 'Income tax rate is missing. Cancel this period, then run it with an income tax rate to calculate tax depreciation and deferred tax.',
    mn: 'Орлогын албан татварын хувь оруулаагүй байна. Энэ үеийг цуцлаад, Ажиллуулах товчоор хувиа оруулж татварын тооцоог хийнэ.',
  },
  'income-tax-rate-run-description': {
    en: 'Enter the income tax rate and recalculate depreciation and deferred tax for this period.',
    mn: 'Орлогын албан татварын хувийг оруулж, энэ үеийн элэгдэл болон хойшлогдсон татварыг дахин тооцоолно.',
  },
  'income-tax-rate': {
    en: 'Income tax rate (%)',
    mn: 'Орлогын албан татварын хувь (%)',
  },
  'tax-depreciation': { en: 'Tax depreciation', mn: 'Татварын элэгдэл' },
  'tax-accumulated-depreciation': {
    en: 'Accumulated tax depreciation',
    mn: 'Татварын хуримтлагдсан элэгдэл',
  },
  'tax-opening-accumulated-depreciation': {
    en: 'Total opening tax depreciation',
    mn: 'Татварын эхний хуримтлагдсан элэгдэл (нийт)',
  },
  'depreciation-temporary-difference': {
    en: 'Depreciation temporary difference',
    mn: 'Элэгдлийн түр зөрүү',
  },
};

export const getFxaTaxLabel = (
  t: TFunction<'accounting'>,
  key: string,
): string => {
  const label = labels[key];
  if (!label) return t(key);
  const i18n = getI18n?.();
  const language = i18n?.resolvedLanguage || i18n?.language || 'en';
  return t(key, {
    defaultValue: language.startsWith('mn') ? label.mn : label.en,
  });
};
