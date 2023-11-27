import { Schema } from 'mongoose';
import { Zmss } from '.';

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
  '-action': number;
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
  '-action': number;
  o_c_schedule_due_date: Date;
  o_c_schedule_principal: number;
  o_c_schedule_interest: number;
  o_c_schedule_additional: number;
  o_c_schedule_balance: number;
}

interface o_c_loan_payment {
  '-action': number;
  o_c_payment_due_date: Date;
  o_c_payment_date: Date;
  o_c_payment_principal: number;
  o_c_payment_interest: number;
  o_c_payment_additional: number;
}

interface o_c_related_customers {
  '-action': number;
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
  '-action': number;
  o_shareholder_org_name: string;
  o_shareholder_org_isforeign: string;
  o_shareholder_org_state_regnum: string;
  o_shareholder_org_regnum: string;
  o_shareholder_org_address: string;
  o_shareholder_org_phone: string;
  o_shareholder_org_email: string;
}
interface o_shareholder_customers {
  '-action': number;
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

interface IZms {
  o_c_customer_information: {
    '-action': number;
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
      '-action': number;
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
      '-action': number;
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
      '-action': number;
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

export const zmsSchema = new Schema<IZms>({
  o_c_customer_information: {
    '-action': Number,
    c_civil_id: String,
    o_c_regnum: String,
    o_c_customer_name: String,
    c_lastname: String,
    c_familyname: String,
    o_c_isforeign: Boolean,
    o_c_birthdate: Date,
    o_c_address: {
      o_c_address_full: String,
      o_c_address_aimag_city_name: String,
      o_c_address_aimag_city_code: String,
      o_c_address_soum_district_name: String,
      o_c_address_soum_district_code: String,
      o_c_address_bag_khoroo_name: String,
      o_c_address_bag_khoroo_code: String,
      o_c_address_street_name: String,
      o_c_address_region_name: String,
      o_c_address_town_name: String,
      o_c_address_apartment_name: String,
      o_c_address_zipcode: Number
    },
    o_c_phone: String,
    o_c_email: String,
    c_tax_number: String,
    c_family_numof_members: Number,
    c_family_numof_unemployed: Number,
    c_isemployed: Boolean,
    c_occupation: String, // Attachment y
    c_job: {
      c_job_position: String,
      c_job_name: String,
      c_job_address: String,
      c_job_phone: String,
      c_job_mail: String
    },
    o_c_related_orgs: [
      {
        '-action': Number,
        o_c_related_org_index: Number,
        o_c_related_org_name: String,
        o_c_related_org_isforeign: Boolean,
        o_c_related_org_regnum: String,
        o_c_related_org_state_regnum: String,
        o_c_related_org_relation: String, // Attachemnt Г
        o_c_related_org_isfinancial_onus: Boolean
      }
    ],
    o_c_related_customers: [
      {
        '-action': Number,
        o_c_related_customer_index: Number,
        o_c_related_customer_firstname: String,
        o_c_related_customer_lastname: String,
        o_c_related_customer_familyname: String,
        o_c_related_customer_isforeign: Boolean,
        o_c_related_customer_civid_id: String,
        o_c_related_customer_regnum: String,
        o_c_related_customer_relation: String, // Attachment D
        o_c_related_customer_isfinancial_onus: Boolean
      }
    ],
    o_c_customer_bank_relation: String, // Attachment Join I and Z
    //legal
    o_state_regnum: String,
    o_c_legal_status: String, // attachment Ө
    o_numof_employee: Number,
    o_company_type: String, //attachment Ж
    o_orgrate: {
      o_fitch_rating: String, // attachment П
      o_sandp_rating: String, // attachment Р
      o_moodys_rating: String // attachment С
    },
    o_ceo: {
      o_ceo_civil_id: String,
      o_ceo_regnum: String,
      o_ceo_firstname: String,
      o_ceo_lastname: String,
      o_ceo_familyname: String,
      o_ceo_isforeign: Boolean,
      o_ceo_address: String,
      o_ceo_phone: String,
      o_ceo_email: String
    },
    o_numof_shareholder_orgs: Number,
    o_shareholder_orgs: [
      {
        '-action': Number,
        o_shareholder_org_name: String,
        o_shareholder_org_isforeign: String,
        o_shareholder_org_state_regnum: String,
        o_shareholder_org_regnum: String,
        o_shareholder_org_address: String,
        o_shareholder_org_phone: String,
        o_shareholder_org_email: String
      }
    ],
    o_numof_shareholder_customers: Number,
    o_shareholder_customers: [
      {
        '-action': Number,
        o_shareholder_customer_civil_id: String,
        o_shareholder_customer_regnum: String,
        o_sharehoslder_customer_firstname: String,
        o_shareholder_customer_lastname: String,
        o_shareholder_customer_familyname: String,
        o_shareholder_customer_isforeign: Boolean,
        o_shareholder_customer_address: String,
        o_shareholder_customer_phone: String,
        o_shareholder_customer_email: String
      }
    ]
  },
  o_c_loan_information: [
    {
      '-action': Number,
      o_c_loan_contract_date: Date,
      o_c_loan_contractno: String,
      o_c_loan_contract_change_reason: String,
      o_c_loan_amount: Number,
      o_c_loan_collateral_indexes: [],
      o_c_loan_related_org_indexes: [],
      o_c_loan_related_customer_indexes: [],
      o_c_loan_balance_lcy: Number,
      o_c_loan_balance_fcy: Number,
      o_c_loan_interest_balance_lcy: Number,
      o_c_loan_interest_balance_fcy: Number,
      o_c_loan_additional_interest_balance_lcy: Number,
      o_c_loan_additional_interest_balance_fcy: Number,
      o_c_loan_currency_rate: Number,
      o_c_loan_loan_provenance: String, // Attacment K
      o_c_loan_bond_market: String,
      o_c_loan_numof_bonds: Number,
      o_c_loan_bond_unit_price: Number,
      o_c_loan_starteddate: Date,
      o_c_loan_expdate: Date,
      o_c_loan_status: String, // add New attachment
      o_c_loan_decide_status: String, // Add new Attachment
      o_c_loan_paiddate: Date,
      o_c_loan_currency: String, // Attachment B
      o_c_loan_sector: String, // Attachment A
      o_c_loan_interest_rate: Number,
      o_c_loan_additional_interest_rate: Number,
      o_c_loan_commission: Number,
      o_c_loan_fee: Number,
      o_c_loan_class: String, // Attachment Yo
      o_c_loan_type: String, //New Attachment
      o_c_loan_line_contractno: String,
      o_c_loan_transactions: {
        o_c_loan_schedule_type: String, //Attachment I
        o_c_loan_schedule_status: Boolean,
        o_c_loan_schedule_change_reason: String,
        o_c_loan_schedule: [
          {
            '-action': Number,
            o_c_schedule_due_date: Date,
            o_c_schedule_principal: Number,
            o_c_schedule_interest: Number,
            o_c_schedule_additional: Number,
            o_c_schedule_balance: Number
          }
        ],
        o_c_loan_payment: [
          {
            '-action': Number,
            o_c_payment_due_date: Date,
            o_c_payment_date: Date,
            o_c_payment_principal: Number,
            o_c_payment_interest: Number,
            o_c_payment_additional: Number
          }
        ]
      }
    }
  ],
  o_c_loanline: [
    {
      '-action': Number,
      o_c_loanline_contract_date: Date,
      o_c_loanline_contractno: String,
      o_c_loanline_contract_change_reason: String,
      o_c_loanline_type: String, // Attachment L
      o_c_loanline_advamount_lcy: Number,
      o_c_loanline_advamount_fcy: Number,
      o_c_loanline_starteddate: Date,
      o_c_loanline_expdate: Date,
      o_c_loanline_currency: String, // Attachment B
      o_c_loanline_currency_rate: Number,
      o_c_loanline_sector: String, // Attachment A
      o_c_loanline_interest_rate: Number,
      o_c_loanline_commitment_interest_rate: Number,
      o_c_loanline_balance: Number,
      o_c_loanline_paiddate: Date,
      o_c_loanline_status: String // Add New Attachment
    }
  ],
  o_c_coll_information: [
    {
      '-action': Number,
      o_c_coll_index: Number,
      o_c_coll_internalno: String,
      o_c_coll_type: String, // attachment B
      o_c_coll_description: String,
      o_c_coll_valuation_date: Date,
      o_c_coll_value: Number,
      o_c_coll_max_value: Number,
      o_c_coll_address: String,
      o_c_coll_zipcode: Number,
      o_c_coll_is_real_estate: Boolean,
      o_c_coll_state_registration: {
        o_c_coll_certificateno: String,
        o_c_coll_state_regnum: String,
        o_c_coll_registered_date: Date,
        o_c_coll_confirmed_date: Date
      },
      o_c_coll_other_registration: {
        o_c_coll_other_certificateno: String,
        o_c_coll_other_regnum: String,
        o_c_coll_other_name: String,
        o_c_coll_other_registered_date: Date
      },
      o_c_coll_customer: {
        o_c_coll_customer_firstname: String,
        o_c_coll_customer_lastname: String,
        o_c_coll_customer_isforeign: Boolean,
        o_c_coll_customer_civil_id: String,
        o_c_coll_customer_regnum: String
      },
      o_c_coll_org: {
        o_c_coll_org_name: String,
        o_c_coll_org_islocal: Boolean,
        o_c_coll_org_regnum: String,
        o_c_coll_org_state_regnum: String
      }
    }
  ]
});

export const loadZmsClass = () => {
  class Zms {
    public static async getZms(_id: string) {
      const zms = await Zmss.findOne({ _id });

      if (!zms) {
        throw new Error('Zms not found');
      }

      return zms;
    }

    // create
    public static async createZms(doc) {
      return Zmss.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  zmsSchema.loadClass(Zms);

  return zmsSchema;
};

// tslint:disable-next-line
