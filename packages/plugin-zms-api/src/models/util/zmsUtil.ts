type Validation = {
  field: string;
  regex?: RegExp;
  isRequired?: boolean;
  childrens?: Validation[];
};

const dictionary = {
  currency: 'currency'
};

const stringRegex = (to: number = 50) =>
  new RegExp(`^[a-zA-Zа-яА-ЯёЁөӨүҮ -]{1,${to}}$`);
const IdRegex = /^[a-zA-Z.0-9._@!#$%^&*()+-=]{1,12}$/;
const registerRegex = /^[a-zA-Zа-яА-ЯёЁөӨүҮ0-9]{1,16}$/;
const pureDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
const numberRegex = /^\d+$/;
const booleanRegex = /^[0-1]{1}$/;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const numberLimRegex = /^\d{1,10}$/;
const fullDateRegex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
const amountRegex = /^([0-9]{1,20}).([0-9]{2})/;

function fieldValidator(
  object,
  validation: Validation,
  resultList
): { hasError: boolean; errorMessage?: string; field?: string } {
  if (Array.isArray(object?.[validation.field])) {
    zmsListValidator(
      object?.[validation.field],
      validation.childrens ?? [],
      resultList
    );
    return { hasError: false };
  } else if (typeof object?.[validation.field] === 'object') {
    zmsObjectValidator(
      object?.[validation.field],
      validation.childrens ?? [],
      resultList
    );
    return { hasError: false };
  } else if (validation.isRequired) {
    if (validation.regex) {
      if (validation.regex?.test(object?.[validation.field]))
        return { hasError: false };
      return {
        hasError: true,
        errorMessage: `regex not match ${validation.regex}`,
        field: validation.field
      };
    } else if (object?.[validation.field]) return { hasError: false };
    return {
      hasError: true,
      errorMessage: 'field not has value',
      field: validation.field
    };
  }
  return { hasError: false };
}

function zmsObjectValidator(
  zms: IZms,
  objectValidator: Validation[],
  resultList
) {
  try {
    objectValidator.forEach(el => {
      const { hasError, errorMessage, field } = fieldValidator(
        zms,
        el,
        resultList
      );
      if (hasError) resultList.push({ field, errorMessage });
    });
  } catch (error) {
    console.log('error: ', error);
  }
}

export function zmsListValidator(
  zmsList: IZms[],
  validationFieldConfig: Validation[] = validationFields,
  resultList = []
) {
  zmsList.forEach(zms => {
    zmsObjectValidator(zms, validationFieldConfig, resultList);
  });
  return resultList;
}

export const validationFields = [
  {
    field: 'patch_number',
    isRequired: true,
    regex: numberLimRegex
  },
  {
    field: 'data_provider_regnum',
    isRequired: true,
    regex: numberLimRegex
  },
  {
    field: 'o_c_customer_information',
    isRequired: true,
    childrens: [
      {
        field: 'c_civil_id',
        isRequired: true,
        regex: IdRegex
      },
      {
        field: 'o_c_regnum',
        isRequired: true,
        regex: registerRegex
      },
      {
        field: 'o_c_customer_name',
        isRequired: true,
        regex: stringRegex()
      },
      {
        field: 'c_lastname',
        isRequired: true,
        regex: stringRegex()
      },
      {
        field: 'c_familyname',
        isRequired: true,
        regex: stringRegex()
      },
      {
        field: 'o_c_isforeign',
        isRequired: true,
        regex: booleanRegex
      },
      {
        field: 'o_c_birthdate',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_phone',
        isRequired: true,
        regex: numberRegex
      },
      {
        field: 'o_c_email',
        isRequired: true,
        regex: emailRegex
      },
      {
        field: 'c_tax_number',
        isRequired: true,
        regex: stringRegex()
      },
      {
        field: 'c_family_numof_members',
        isRequired: true,
        regex: numberLimRegex
      },
      {
        field: 'c_family_numof_unemployed',
        isRequired: true,
        regex: numberLimRegex
      },
      {
        field: 'c_isemployed',
        isRequired: true,
        regex: booleanRegex
      },
      {
        field: 'c_occupation',
        isRequired: true,
        regex: stringRegex(),
        dictionary: dictionary.currency
      },
      {
        field: 'o_c_address',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_address_full',
            isRequired: true,
            regex: stringRegex(250)
          },
          {
            field: 'o_c_address_aimag_city_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_aimag_city_code',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_soum_district_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_soum_district_code',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_bag_khoroo_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_bag_khoroo_code',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_street_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_region_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_town_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_apartment_name',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_address_zipcode',
            isRequired: false,
            regex: numberLimRegex
          }
        ]
      },
      {
        field: 'c_job',
        isRequired: true,
        childrens: [
          {
            field: 'c_job_position',
            isRequired: true,
            regex: stringRegex(100)
          },
          {
            field: 'c_job_name',
            isRequired: true,
            regex: stringRegex(100)
          },
          {
            field: 'c_job_address',
            isRequired: true,
            regex: stringRegex(250)
          },
          {
            field: 'c_job_phone',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'c_job_mail',
            isRequired: true,
            regex: stringRegex()
          }
        ]
      },
      {
        field: 'o_c_related_orgs',
        isRequired: true,
        children: [
          {
            field: 'o_c_related_org_index',
            isRequired: true,
            regex: numberLimRegex
          },
          {
            field: 'o_c_related_org_name',
            isRequired: true,
            regex: stringRegex(100)
          },
          {
            field: 'o_c_related_org_isforeign',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_related_org_regnum',
            isRequired: false,
            regex: registerRegex
          },
          {
            field: 'o_c_related_org_state_regnum',
            isRequired: false,
            regex: stringRegex(12)
          },
          {
            field: 'o_c_related_org_relation',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_related_org_isfinancial_onus',
            isRequired: true,
            regex: booleanRegex
          }
        ]
      },
      {
        field: 'o_c_related_customers',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_related_customer_index',
            isRequired: true,
            regex: numberLimRegex
          },
          {
            field: 'o_c_related_customer_firstname',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_related_customer_lastname',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_related_customer_familyname',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_related_customer_isforeign',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_related_customer_civid_id',
            isRequired: true,
            regex: stringRegex(12)
          },
          {
            field: 'o_c_related_customer_regnum',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_related_customer_relation',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_related_customer_isfinancial_onus',
            isRequired: true,
            regex: booleanRegex
          }
        ]
      },
      {
        field: 'o_c_customer_bank_relation',
        isRequired: true,
        regex: registerRegex
      }
    ]
  },
  {
    field: 'o_c_loan_information',
    isRequired: true,
    childrens: [
      {
        field: 'o_c_loan_contract_date',
        isRequired: true,
        regex: fullDateRegex
      },
      {
        field: 'o_c_loan_amount',
        regex: amountRegex,
        isRequired: true
      },
      {
        field: 'o_c_loan_collateral_indexes',
        isRequired: true
      },
      {
        field: 'o_c_loan_related_org_indexes',
        isRequired: true
      },
      {
        field: 'o_c_loan_related_customer_indexes',
        isRequired: true
      },
      {
        field: 'o_c_loan_balance_lcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_balance_fcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_interest_balance_lcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_additional_interest_balance_fcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_currency_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_loan_provenance',
        isRequired: true
      },
      {
        field: 'o_c_loan_bond_market',
        isRequired: false,
        regex: stringRegex(100)
      },
      {
        field: 'o_c_loan_numof_bonds',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_bond_unit_price',
        isRequired: false,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_starteddate',
        isRequired: true,
        regex: fullDateRegex
      },
      {
        field: 'o_c_loan_expdate',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_loan_status',
        isRequired: true
      },
      {
        field: 'o_c_loan_decide_status',
        isRequired: true
      },
      {
        field: 'o_c_loan_paiddate',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_loan_currency',
        isRequired: true
      },
      {
        field: 'o_c_loan_sector',
        isRequired: true
      },
      {
        field: 'o_c_loan_interest_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_additional_interest_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_commission',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_fee',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loan_class',
        isRequired: true
      },
      {
        field: 'o_c_loan_type',
        isRequired: true
      },
      {
        field: 'o_c_loan_line_contractno',
        isRequired: true,
        regex: /^[a-zA-Z.0-9._@!#$%^&*()+-=]{1,50}$/
      },
      {
        field: 'o_c_loan_transactions',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_loan_schedule_type',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_loan_schedule_status',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_loan_schedule_change_reason',
            isRequired: true,
            regex: stringRegex(250)
          },
          {
            field: 'o_c_loan_schedule',
            isRequired: true,
            childrens: [
              {
                field: 'o_c_schedule_due_date',
                isRequired: true,
                regex: pureDateRegex
              },
              {
                field: 'o_c_schedule_principal',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_schedule_interest',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_schedule_additional',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_schedule_balance',
                isRequired: true,
                regex: amountRegex
              }
            ]
          },
          {
            field: 'o_c_loan_payment',
            isRequired: true,
            childrens: [
              {
                field: 'o_c_payment_due_date',
                isRequired: true,
                regex: pureDateRegex
              },
              {
                field: 'o_c_payment_date',
                isRequired: true,
                regex: pureDateRegex
              },
              {
                field: 'o_c_payment_principal',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_payment_interest',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_payment_additional',
                isRequired: true,
                regex: amountRegex
              }
            ]
          }
        ]
      }
    ]
  },
  {
    field: 'o_c_loanline',
    isRequired: true,
    childrens: [
      {
        field: 'o_c_loanline_contract_date',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_loanline_contractno',
        isRequired: true,
        regex: stringRegex(50)
      },
      {
        field: 'o_c_loanline_contract_change_reason',
        isRequired: true,
        regex: stringRegex(50)
      },
      {
        field: 'o_c_loanline_type',
        isRequired: true
      },
      {
        field: 'o_c_loanline_advamount_lcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_advamount_fcy',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_starteddate',
        isRequired: true,
        regex: fullDateRegex
      },
      {
        field: 'o_c_loanline_expdate',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_loanline_currency',
        isRequired: true
      },
      {
        field: 'o_c_loanline_currency_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_sector',
        isRequired: true
      },
      {
        field: 'o_c_loanline_interest_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_commitment_interest_rate',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_balance',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_loanline_paiddate',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_loanline_status',
        isRequired: true
      }
    ]
  },
  {
    field: 'o_c_coll_information',
    isRequired: true,
    childrens: [
      {
        field: 'o_c_coll_index',
        isRequired: true,
        regex: numberLimRegex
      },
      {
        field: 'o_c_coll_contractno',
        isRequired: true,
        regex: stringRegex(20)
      },
      {
        field: 'o_c_coll_internalno',
        isRequired: true,
        regex: stringRegex(20)
      },
      {
        field: 'o_c_coll_type',
        isRequired: true
      },
      {
        field: 'o_c_coll_description',
        isRequired: true,
        regex: stringRegex(250)
      },
      {
        field: 'o_c_coll_valuation_date',
        isRequired: true,
        regex: pureDateRegex
      },
      {
        field: 'o_c_coll_value',
        isRequired: true,
        regex: amountRegex
      },
      {
        field: 'o_c_coll_max_value',
        regex: amountRegex
      },
      {
        field: 'o_c_coll_address',
        isRequired: true,
        regex: stringRegex(250)
      },
      {
        field: 'o_c_coll_zipcode',
        isRequired: true,
        regex: numberLimRegex
      },
      {
        field: 'o_c_coll_is_real_estate',
        isRequired: true,
        regex: booleanRegex
      },
      {
        field: 'o_c_coll_state_registration',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_coll_certificateno',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_state_regnum',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_registered_date',
            isRequired: true,
            regex: pureDateRegex
          },
          {
            field: 'o_c_coll_confirmed_date',
            isRequired: true,
            regex: pureDateRegex
          }
        ]
      },
      {
        field: 'o_c_coll_other_registration',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_coll_other_certificateno',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_other_regnum',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_other_name',
            isRequired: true,
            regex: stringRegex(100)
          },
          {
            field: 'o_c_coll_other_registered_date',
            isRequired: true,
            regex: pureDateRegex
          }
        ]
      },
      {
        field: 'o_c_coll_customer',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_coll_customer_firstname',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_customer_lastname',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_customer_isforeign',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_coll_customer_civil_id',
            isRequired: true,
            regex: IdRegex
          },
          {
            field: 'o_c_coll_customer_regnum',
            isRequired: true,
            regex: stringRegex(16)
          }
        ]
      },
      {
        field: 'o_c_coll_org',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_coll_org_name',
            isRequired: true,
            regex: stringRegex(50)
          },
          {
            field: 'o_c_coll_org_islocal',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_coll_org_regnum',
            isRequired: true,
            regex: stringRegex(16)
          },
          {
            field: 'o_c_coll_org_state_regnum',
            isRequired: true,
            regex: stringRegex(16)
          }
        ]
      }
    ]
  }
];

//#region interface

interface Io_c_address {
  o_c_address_full: string;
  o_c_address_aimag_city_name: string;
  o_c_address_aimag_city_code: string;
  o_c_address_soum_district_name: string;
  o_c_address_soum_district_code: string;
  o_c_address_bag_khoroo_name: string;
  o_c_address_bag_khoroo_code: string;
  o_c_address_street_name: string;
  o_c_address_region_name: string;
  o_c_address_town_name: string;
  o_c_address_apartment_name: string;
  o_c_address_zipcode: number;
}

interface c_job {
  c_job_position: string;
  c_job_name: string;
  c_job_address: string;
  c_job_phone: string;
  c_job_mail: string;
}

interface o_c_related_orgs {
  '-action': string;
  o_c_related_org_index: number;
  o_c_related_org_name: string;
  o_c_related_org_isforeign: boolean;
  o_c_related_org_regnum: string;
  o_c_related_org_state_regnum: string;
  o_c_related_org_relation: string;
  o_c_related_org_isfinancial_onus: boolean;
}

interface o_c_loan_transactions {
  o_c_loan_schedule_type: string; //хавсрал Й
  o_c_loan_schedule_status: boolean;
  o_c_loan_schedule_change_reason: string;
  o_c_loan_schedule: [o_c_loan_schedule];
  o_c_loan_payment: [o_c_loan_payment];
}

interface o_c_loan_schedule {
  '-action': string;
  o_c_schedule_due_date: Date;
  o_c_schedule_principal: number;
  o_c_schedule_interest: number;
  o_c_schedule_additional: number;
  o_c_schedule_balance: number;
}

interface o_c_loan_payment {
  '-action': string;
  o_c_payment_due_date: Date;
  o_c_payment_date: Date;
  o_c_payment_principal: number;
  o_c_payment_interest: number;
  o_c_payment_additional: number;
}

interface o_c_related_customers {
  '-action': string;
  o_c_related_customer_index: number;
  o_c_related_customer_firstname: string;
  o_c_related_customer_lastname: string;
  o_c_related_customer_familyname: string;
  o_c_related_customer_isforeign: boolean;
  o_c_related_customer_civid_id: string;
  o_c_related_customer_regnum: string;
  o_c_related_customer_relation: string; //хавсралт д
  o_c_related_customer_isfinancial_onus: boolean;
}

interface o_c_coll_state_registration {
  o_c_coll_certificateno: string;
  o_c_coll_state_regnum: string;
  o_c_coll_registered_date: Date;
  o_c_coll_confirmed_date: Date;
}

interface o_c_coll_other_registration {
  o_c_coll_other_certificateno: string;
  o_c_coll_other_regnum: string;
  o_c_coll_other_name: string;
  o_c_coll_other_registered_date: Date;
}

interface o_c_coll_customer {
  o_c_coll_customer_firstname: string;
  o_c_coll_customer_lastname: string;
  o_c_coll_customer_isforeign: boolean;
  o_c_coll_customer_civil_id: string;
  o_c_coll_customer_regnum: string;
}

interface o_c_coll_org {
  o_c_coll_org_name: string;
  o_c_coll_org_islocal: boolean;
  o_c_coll_org_regnum: string;
  o_c_coll_org_state_regnum: string;
}

//Begin legal

interface o_orgrate {
  o_fitch_rating: string; // attachment П
  o_sandp_rating: string; // attachment Р
  o_moodys_rating: string; // attachment С
}

interface o_ceo {
  o_ceo_civil_id: string;
  o_ceo_regnum: string;
  o_ceo_firstname: string;
  o_ceo_lastname: string;
  o_ceo_familyname: string;
  o_ceo_isforeign: boolean;
  o_ceo_address: string;
  o_ceo_phone: string;
  o_ceo_email: string;
}

interface o_shareholder_orgs {
  '-action': string;
  o_shareholder_org_name: string;
  o_shareholder_org_isforeign: string;
  o_shareholder_org_state_regnum: string;
  o_shareholder_org_regnum: string;
  o_shareholder_org_address: string;
  o_shareholder_org_phone: string;
  o_shareholder_org_email: string;
}
interface o_shareholder_customers {
  '-action': string;
  o_shareholder_customer_civil_id: string;
  o_shareholder_customer_regnum: string;
  o_shareholder_customer_firstname: string;
  o_shareholder_customer_lastname: string;
  o_shareholder_customer_familyname: string;
  o_shareholder_customer_isforeign: boolean;
  o_shareholder_customer_address: string;
  o_shareholder_customer_phone: string;
  o_shareholder_customer_email: string;
}
// end legal

export interface IZms {
  o_c_customer_information: {
    '-action': string;
    c_civil_id: string;
    o_c_regnum: string;
    o_c_customer_name: string;
    c_lastname: string;
    c_familyname: string;
    o_c_isforeign: boolean;
    o_c_birthdate: Date;
    o_c_address: Io_c_address;
    o_c_phone: number;
    o_c_email: string;
    c_tax_number: string;
    c_family_numof_members: number;
    c_family_numof_unemployed: number;
    c_isemployed: boolean;
    c_occupation: string; //хавсрал У
    c_job: c_job;
    o_c_related_orgs: [o_c_related_orgs];
    o_c_related_customers: [o_c_related_customers];
    o_c_customer_bank_relation: string; // хавсрал З болон И нэгтгэх
    //legal
    o_state_regnum: string;
    o_c_legal_status: string; // attachment Ө
    o_numof_employee: number;
    o_company_type: string; //attachment Ж
    o_orgrate: o_orgrate;
    o_ceo: o_ceo;
    o_numof_shareholder_orgs: number;
    o_shareholder_orgs: [o_shareholder_orgs];
    o_numof_shareholder_customers: number;
    o_shareholder_customers: [o_shareholder_customers];
  };

  o_c_loan_information: [
    {
      '-action': string;
      o_c_loan_contract_date: Date;
      o_c_loan_contractno: string;
      o_c_loan_contract_change_reason: string;
      o_c_loan_amount: number;
      o_c_loan_collateral_indexes: [];
      o_c_loan_related_org_indexes: [];
      o_c_loan_related_customer_indexes: [];
      o_c_loan_balance_lcy: number;
      o_c_loan_balance_fcy: number;
      o_c_loan_interest_balance_lcy: number;
      o_c_loan_interest_balance_fcy: number;
      o_c_loan_additional_interest_balance_lcy: number;
      o_c_loan_additional_interest_balance_fcy: number;
      o_c_loan_currency_rate: number;
      o_c_loan_loan_provenance: string; //хавсрал К
      o_c_loan_bond_market: string;
      o_c_loan_numof_bonds: number;
      o_c_loan_bond_unit_price: number;
      o_c_loan_starteddate: Date;
      o_c_loan_expdate: Date;
      o_c_loan_status: string; // new
      o_c_loan_decide_status: string; // new
      o_c_loan_paiddate: Date;
      o_c_loan_currency: string; // хавсралт Б
      o_c_loan_sector: string; //хавсралт А
      o_c_loan_interest_rate: number;
      o_c_loan_additional_interest_rate: number;
      o_c_loan_commission: number;
      o_c_loan_fee: number;
      o_c_loan_class: string; //хавсрал Ё
      o_c_loan_type: string;
      new;
      o_c_loan_line_contractno: string;
      o_c_loan_transactions: o_c_loan_transactions;
    }
  ];

  o_c_loanline: [
    {
      '-action': string;
      o_c_loanline_contract_date: Date;
      o_c_loanline_contractno: string;
      o_c_loanline_contract_change_reason: string;
      o_c_loanline_type: string; // хавсралт Л
      o_c_loanline_advamount_lcy: number;
      o_c_loanline_advamount_fcy: number;
      o_c_loanline_starteddate: Date;
      o_c_loanline_expdate: Date;
      o_c_loanline_currency: string; // хавсралт Б
      o_c_loanline_currency_rate: number;
      o_c_loanline_sector: string; // хавсралт А
      o_c_loanline_interest_rate: number;
      o_c_loanline_commitment_interest_rate: number;
      o_c_loanline_balance: number;
      o_c_loanline_paiddate: Date;
      o_c_loanline_status: string; // new
    }
  ];

  o_c_coll_information: [
    {
      '-action': string;
      o_c_coll_index: number;
      o_c_coll_internalno: string;
      o_c_coll_type: string; // хавсралт В
      o_c_coll_description: string;
      o_c_coll_valuation_date: Date;
      o_c_coll_value: number;
      o_c_coll_max_value: number;
      o_c_coll_address: string;
      o_c_coll_zipcode: number;
      o_c_coll_is_real_estate: boolean;
      o_c_coll_state_registration: o_c_coll_state_registration;
      o_c_coll_other_registration: o_c_coll_other_registration;
      o_c_coll_customer: o_c_coll_customer;
      o_c_coll_org: o_c_coll_org;
    }
  ];
}

//#endregion
