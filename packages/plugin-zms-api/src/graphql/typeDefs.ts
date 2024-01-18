import gql from 'graphql-tag';

const types = `
  type ZmsDictionary {
    _id: String,
    parentId: String,
    name: String,
    code: String,
    type: String,
    isParent: Boolean,
    createdAt: Date,
    createdBy: String
  }

  type CustomerJob {
    c_job_position: String,
    c_job_name: String,
    c_job_address: String,
    c_job_phone: String,
    c_job_mail: String
  }

  type CustomerAddress {
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
    o_c_address_zipcode: Float
  }

  type CustomerRelatedOrgs {
    action: String,
    o_c_related_org_index: Float,
    o_c_related_org_name: String,
    o_c_related_org_isforeign: Boolean,
    o_c_related_org_regnum: String,
    o_c_related_org_state_regnum: String,
    o_c_related_org_relation: String, 
    o_c_related_org_isfinancial_onus: Boolean
  }

type CustomerRelatedCustomers {
    action: String,
    o_c_related_customer_index: Float,
    o_c_related_customer_firstname: String,
    o_c_related_customer_lastname: String,
    o_c_related_customer_familyname: String,
    o_c_related_customer_isforeign: Boolean,
    o_c_related_customer_civid_id: String,
    o_c_related_customer_regnum: String,
    o_c_related_customer_relation: String, 
    o_c_related_customer_isfinancial_onus: Boolean
  }

  type CustomerOrgrate {
    o_fitch_rating: String, 
    o_sandp_rating: String, 
    o_moodys_rating: String 
  }

  type CustomerCeo {
    o_ceo_civil_id: String,
    o_ceo_regnum: String,
    o_ceo_firstname: String,
    o_ceo_lastname: String,
    o_ceo_familyname: String,
    o_ceo_isforeign: Boolean,
    o_ceo_address: String,
    o_ceo_phone: String,
    o_ceo_email: String
  }

  type CustomershareholderOrgs
    {
      action: String,
      o_shareholder_org_name: String,
      o_shareholder_org_isforeign: String,
      o_shareholder_org_state_regnum: String,
      o_shareholder_org_regnum: String,
      o_shareholder_org_address: String,
      o_shareholder_org_phone: String,
      o_shareholder_org_email: String
    }
        
  type CustomerShareholderCustomers {
      action: String,
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

  type CustomerImpormationJson {
    action: String,
    c_civil_id: String,
    o_c_regnum: String,
    o_c_customer_name: String,
    c_lastname: String,
    c_familyname: String,
    o_c_isforeign: Boolean,
    o_c_birthdate: Date,
    o_c_phone: String,
    o_c_email: String,
    c_tax_number: String,
    c_family_numof_members: Float,
    c_family_numof_unemployed: Float,
    c_isemployed: Boolean,
    c_occupation: String, 
    o_c_customer_bank_relation: String,
    o_state_regnum: String,
    o_c_legal_status: String, 
    o_numof_employee: Float,
    o_company_type: String, 
    o_numof_shareholder_orgs: Float,
    o_numof_shareholder_customers: Float,
    o_c_address: CustomerAddress,
    c_job:CustomerJob,
    o_c_related_orgs: [CustomerRelatedOrgs],
    o_c_related_customers: [CustomerRelatedCustomers],
    o_orgrate: CustomerOrgrate,
    o_ceo: CustomerCeo,
    o_shareholder_orgs: [CustomershareholderOrgs],
    o_shareholder_customers: [CustomerShareholderCustomers]

  }

  type CustomerLoanSchedule {
      action: String,
      o_c_schedule_due_date: Date,
      o_c_schedule_principal: Float,
      o_c_schedule_interest: Float,
      o_c_schedule_additional: Float,
      o_c_schedule_balance: Float
    }
  
  type CustomerLoanPayment {
      action: String,
      o_c_payment_due_date: Date,
      o_c_payment_date: Date,
      o_c_payment_principal: Float,
      o_c_payment_interest: Float,
      o_c_payment_additional: Float
    }
  
  type CustomerLoanTransactions {
    o_c_loan_schedule_type: String, 
    o_c_loan_schedule_status: Boolean,
    o_c_loan_schedule_change_reason: String,
    o_c_loan_schedule: [CustomerLoanSchedule],
    o_c_loan_payment: [CustomerLoanPayment]
  }

  type CustomerLoanInformation {
      action: String,
      o_c_loan_contract_date: Date,
      o_c_loan_contractno: String,
      o_c_loan_contract_change_reason: String,
      o_c_loan_amount: Float,
      o_c_loan_collateral_indexes: [String],
      o_c_loan_related_org_indexes: [String],
      o_c_loan_related_customer_indexes: [String],
      o_c_loan_balance_lcy: Float,
      o_c_loan_balance_fcy: Float,
      o_c_loan_interest_balance_lcy: Float,
      o_c_loan_interest_balance_fcy: Float,
      o_c_loan_additional_interest_balance_lcy: Float,
      o_c_loan_additional_interest_balance_fcy: Float,
      o_c_loan_currency_rate: Float,
      o_c_loan_loan_provenance: String, 
      o_c_loan_bond_market: String,
      o_c_loan_numof_bonds: Float,
      o_c_loan_bond_unit_price: Float,
      o_c_loan_starteddate: Date,
      o_c_loan_expdate: Date,
      o_c_loan_status: String, 
      o_c_loan_decide_status: String, 
      o_c_loan_paiddate: Date,
      o_c_loan_currency: String, 
      o_c_loan_sector: String, 
      o_c_loan_interest_rate: Float,
      o_c_loan_additional_interest_rate: Float,
      o_c_loan_commission: Float,
      o_c_loan_fee: Float,
      o_c_loan_class: String,
      o_c_loan_type: String, 
      o_c_loan_line_contractno: String,
      o_c_loan_transactions: CustomerLoanTransactions
    }

  type  CustomerLoanLine {
      action: String,
      o_c_loanline_contract_date: Date,
      o_c_loanline_contractno: String,
      o_c_loanline_contract_change_reason: String,
      o_c_loanline_type: String, 
      o_c_loanline_advamount_lcy: Float,
      o_c_loanline_advamount_fcy: Float,
      o_c_loanline_starteddate: Date,
      o_c_loanline_expdate: Date,
      o_c_loanline_currency: String, 
      o_c_loanline_currency_rate: Float,
      o_c_loanline_sector: String, 
      o_c_loanline_interest_rate: Float,
      o_c_loanline_commitment_interest_rate: Float,
      o_c_loanline_balance: Float,
      o_c_loanline_paiddate: Date,
      o_c_loanline_status: String 
    }

  type CustomerCollStateRegistration {
    o_c_coll_certificateno: String,
    o_c_coll_state_regnum: String,
    o_c_coll_registered_date: Date,
    o_c_coll_confirmed_date: Date
  }

  type CustomerCollOtherRegistration {
    o_c_coll_other_certificateno: String,
    o_c_coll_other_regnum: String,
    o_c_coll_other_name: String,
    o_c_coll_other_registered_date: Date
  }

  type CustomerCollCustomer {
    o_c_coll_customer_firstname: String,
    o_c_coll_customer_lastname: String,
    o_c_coll_customer_isforeign: Boolean,
    o_c_coll_customer_civil_id: String,
    o_c_coll_customer_regnum: String
  }

  type CustomerCollOrg {
    o_c_coll_org_name: String,
    o_c_coll_org_islocal: Boolean,
    o_c_coll_org_regnum: String,
    o_c_coll_org_state_regnum: String
  }

  type CustomerCollInformation {
        action: String,
        o_c_coll_index: Float,
        o_c_coll_internalno: String,
        o_c_coll_type: String, 
        o_c_coll_description: String,
        o_c_coll_valuation_date: Date,
        o_c_coll_value: Float,
        o_c_coll_max_value: Float,
        o_c_coll_address: String,
        o_c_coll_zipcode: Float,
        o_c_coll_is_real_estate: Boolean,
        o_c_coll_state_registration: CustomerCollStateRegistration
        o_c_coll_other_registration: CustomerCollOtherRegistration,
        o_c_coll_customer: CustomerCollCustomer,
        o_c_coll_org: CustomerCollOrg
      }
 
  type CustomerImpormation {
    o_c_customercode: String,
    o_c_customername: String,
    o_c_registerno: String,
  }

  type Customer {
    o_c_customer_information: CustomerImpormation,
  }

  type ZmsJson {
    _id:String,
    patch_number:Float,
    data_provider_regnum:Float,
    o_c_customer_information: CustomerImpormationJson,
    o_c_loan_information:CustomerLoanInformation,
    o_c_loanline:[CustomerLoanLine],
    o_c_coll_information: [CustomerCollInformation],
  }
  type Zms {
    _id:String,
    customer: Customer
  }
`;
const paramsZmsInquire = `
  keyword: String,
  foreignCitizen: Boolean,
  reportPurpose: String,
  liveStockYear: String,
  resultType: String,
  organizationType: String,
  typeInquire: String
`;

const paramsAction = `
rd: String,
createAt: Date,
loanAmount: Float
`;

const queries = `
  getZmsDictionary(_id:String!): ZmsDictionary
  getZms(_id:String!): JSON
  getDictionaries(isParent: Boolean, parentId: String): [ZmsDictionary]
  getZmses(isClosed: Boolean): [Zms]
  getInquire(${paramsZmsInquire}): JSON
  getLogs(isClosed: Boolean): JSON,
  getZmsLogs(zmsId: String): JSON,
`;

const params = `
  parentId: String,
  name: String,
  code: String,
  type: String,
  isParent: Boolean,
  createdAt: Date,
  createdBy: String,
`;

const mutations = `
  createZms(${params}): JSON
  createZmsDictionary(${params}): ZmsDictionary
  zmsDictionaryEdit(_id: String!, ${params}): JSON
  zmsDictionaryRemove(_id: String!, ${params}): JSON
  sendZms(isClosed: Boolean):JSON
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    ${types}
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
