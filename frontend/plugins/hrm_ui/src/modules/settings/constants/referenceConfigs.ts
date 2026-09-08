import {
  HRM_CONTRIBUTION_PROFILES,
  HRM_CONTRIBUTION_PROFILES_COUNT,
} from '../graphql/queries/contributionProfiles';
import {
  HRM_CONTRIBUTION_PROFILES_ARCHIVE,
  HRM_CONTRIBUTION_PROFILES_CREATE,
  HRM_CONTRIBUTION_PROFILES_UPDATE,
} from '../graphql/mutations/contributionProfiles';
import { HRM_GRADES, HRM_GRADES_COUNT } from '../graphql/queries/grades';
import {
  HRM_GRADES_ARCHIVE,
  HRM_GRADES_CREATE,
  HRM_GRADES_UPDATE,
} from '../graphql/mutations/grades';
import {
  HRM_SENIORITY_RULES,
  HRM_SENIORITY_RULES_COUNT,
} from '../graphql/queries/seniorityRules';
import {
  HRM_SENIORITY_RULES_ARCHIVE,
  HRM_SENIORITY_RULES_CREATE,
  HRM_SENIORITY_RULES_UPDATE,
} from '../graphql/mutations/seniorityRules';
import { HRM_SKILLS, HRM_SKILLS_COUNT } from '../graphql/queries/skills';
import {
  HRM_SKILLS_ARCHIVE,
  HRM_SKILLS_CREATE,
  HRM_SKILLS_UPDATE,
} from '../graphql/mutations/skills';
import { HrmReferenceKind, ReferenceConfig } from '../types/settings';

const baseFields = [
  { name: 'code', label: 'Код' },
  { name: 'name', label: 'Нэр' },
  { name: 'description', label: 'Тайлбар', type: 'textarea' },
] as const;

export const referenceConfigs: Record<HrmReferenceKind, ReferenceConfig> = {
  contributionProfiles: {
    kind: 'contributionProfiles',
    title: 'Даатгуулагчийн төрөл',
    description: 'Ажилтан болон байгууллагаас тооцох шимтгэлийн хувь, хязгаар.',
    emptyTitle: 'Даатгуулагчийн төрөл бүртгээгүй байна',
    emptyDescription: 'НДШ болон ижил төрлийн statutory contribution rule-ээ бүртгэнэ.',
    createLabel: 'Төрөл нэмэх',
    listQuery: HRM_CONTRIBUTION_PROFILES,
    countQuery: HRM_CONTRIBUTION_PROFILES_COUNT,
    createMutation: HRM_CONTRIBUTION_PROFILES_CREATE,
    updateMutation: HRM_CONTRIBUTION_PROFILES_UPDATE,
    archiveMutation: HRM_CONTRIBUTION_PROFILES_ARCHIVE,
    listField: 'hrmContributionProfiles',
    countField: 'hrmContributionProfilesCount',
    fields: [
      ...baseFields,
      { name: 'employeeRate', label: 'Ажилтнаас суутгах %', type: 'number' },
      { name: 'employerRate', label: 'Байгууллагаас төлөх %', type: 'number' },
    ],
    buildDoc: (values) => ({
      code: values.code,
      name: values.name,
      description: values.description,
      employeeRate: values.employeeRate || 0,
      employerRate: values.employerRate || 0,
      components: [],
      status: 'active',
    }),
  },
  grades: {
    kind: 'grades',
    title: 'Зэрэг дэв',
    description: 'Payroll profile-д ашиглах зэрэг дэв, rank болон default дүн.',
    emptyTitle: 'Зэрэг дэв бүртгээгүй байна',
    emptyDescription: 'Албан тушаалын түвшин, зэрэглэлд ашиглах лавлах бүртгэнэ.',
    createLabel: 'Зэрэг дэв нэмэх',
    listQuery: HRM_GRADES,
    countQuery: HRM_GRADES_COUNT,
    createMutation: HRM_GRADES_CREATE,
    updateMutation: HRM_GRADES_UPDATE,
    archiveMutation: HRM_GRADES_ARCHIVE,
    listField: 'hrmGrades',
    countField: 'hrmGradesCount',
    fields: [
      ...baseFields,
      { name: 'rank', label: 'Эрэмбэ', type: 'number' },
      { name: 'baseSalary', label: 'Үндсэн цалин', type: 'number' },
      { name: 'allowanceAmount', label: 'Нэмэгдэл дүн', type: 'number' },
      { name: 'allowanceRate', label: 'Нэмэгдэл %', type: 'number' },
    ],
    buildDoc: (values) => ({
      code: values.code,
      name: values.name,
      description: values.description,
      rank: values.rank || 0,
      baseSalary: values.baseSalary || 0,
      allowanceAmount: values.allowanceAmount || 0,
      allowanceRate: values.allowanceRate || 0,
      status: 'active',
    }),
  },
  seniorityRules: {
    kind: 'seniorityRules',
    title: 'Удаан жилийн нэмэгдэл',
    description: 'Ажилласан хугацаагаар fixed эсвэл үндсэн цалингийн хувиар бодох rule.',
    emptyTitle: 'Удаан жилийн rule бүртгээгүй байна',
    emptyDescription: 'Хугацааны bracket-ээр нэмэгдэл тооцох дүрмээ бүртгэнэ.',
    createLabel: 'Rule нэмэх',
    listQuery: HRM_SENIORITY_RULES,
    countQuery: HRM_SENIORITY_RULES_COUNT,
    createMutation: HRM_SENIORITY_RULES_CREATE,
    updateMutation: HRM_SENIORITY_RULES_UPDATE,
    archiveMutation: HRM_SENIORITY_RULES_ARCHIVE,
    listField: 'hrmSeniorityRules',
    countField: 'hrmSeniorityRulesCount',
    fields: [
      ...baseFields,
      {
        name: 'valueType',
        label: 'Бодолтын төрөл',
        type: 'select',
        options: [
          { value: 'percentOfBaseSalary', label: 'Үндсэн цалингийн %' },
          { value: 'fixed', label: 'Тогтмол дүн' },
        ],
      },
      { name: 'minMonths', label: 'Доод сар', type: 'number' },
      { name: 'maxMonths', label: 'Дээд сар', type: 'number' },
      { name: 'value', label: 'Дүн / хувь', type: 'number' },
    ],
    buildDoc: (values) => ({
      code: values.code,
      name: values.name,
      description: values.description,
      valueType: values.valueType || 'percentOfBaseSalary',
      brackets: [
        {
          minMonths: values.minMonths || 0,
          maxMonths: values.maxMonths || undefined,
          value: values.value || 0,
        },
      ],
      status: 'active',
    }),
  },
  skills: {
    kind: 'skills',
    title: 'Ур чадвар',
    description: 'Ажилтны profile, KPI болон payroll үнэлгээнд ашиглах skill лавлах.',
    emptyTitle: 'Ур чадвар бүртгээгүй байна',
    emptyDescription: 'Ажилтны ур чадварын ангилал, онооны лавлах үүсгэнэ.',
    createLabel: 'Ур чадвар нэмэх',
    listQuery: HRM_SKILLS,
    countQuery: HRM_SKILLS_COUNT,
    createMutation: HRM_SKILLS_CREATE,
    updateMutation: HRM_SKILLS_UPDATE,
    archiveMutation: HRM_SKILLS_ARCHIVE,
    listField: 'hrmSkills',
    countField: 'hrmSkillsCount',
    fields: [
      ...baseFields,
      { name: 'category', label: 'Ангилал' },
      { name: 'score', label: 'Оноо', type: 'number' },
    ],
    buildDoc: (values) => ({
      code: values.code,
      name: values.name,
      description: values.description,
      category: values.category,
      score: values.score || 0,
      status: 'active',
    }),
  },
};
