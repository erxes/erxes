import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries, Zmss, ZmsLogs } from '../../models';
import { zmsListValidator } from '../../models/util/zmsUtil';

// #region example data
const zmsList: any = [
  {
    patch_number: 7,
    data_provider_regnum: 7,
    o_c_customer_information: {
      c_civil_id: 'fklfksfk',
      o_c_regnum: 'dsds',
      o_c_customer_name: 'sdsds',
      c_lastname: 'sdsd',
      c_familyname: 'sdsds',
      o_c_isforeign: 1,
      o_c_birthdate: '2015-03-17',
      o_c_address: {
        o_c_address_full: 'sdsd',
        o_c_address_aimag_city_name: 'sdsds',
        o_c_address_aimag_city_code: 'sdsd',
        o_c_address_soum_district_name: 'sds',
        o_c_address_soum_district_code: 'sds',
        o_c_address_bag_khoroo_name: 'sds',
        o_c_address_bag_khoroo_code: 'sdsd',
        o_c_address_street_name: 'sdsd',
        o_c_address_region_name: 'sasa',
        o_c_address_town_name: 'asas',
        o_c_address_apartment_name: 'asas',
        o_c_address_zipcode: 12345
      },
      o_c_phone: '12344444',
      o_c_email: 'asas@gmail.com',
      c_tax_number: 'ddfsdsds',
      c_family_numof_members: 123,
      c_family_numof_unemployed: 123,
      c_isemployed: 1,
      c_occupation: 'dfs',
      c_job: {
        c_job_position: 'fdfd',
        c_job_name: 'dfdf',
        c_job_address: 'dfdf',
        c_job_phone: 'dfdf',
        c_job_mail: 'dfdf'
      },
      o_c_related_orgs: [
        {
          '-action': '',
          o_c_related_org_index: '',
          o_c_related_org_name: 'fdfdff f',
          o_c_related_org_isforeign: 1,
          o_c_related_org_regnum: 'dfsfsv',
          o_c_related_org_state_regnum: 'reret',
          o_c_related_org_relation: 'ewew',
          o_c_related_org_isfinancial_onus: 0
        }
      ],
      o_c_related_customers: [
        {
          '-action': '',
          o_c_related_customer_index: 1545454,
          o_c_related_customer_firstname: 'dds d',
          o_c_related_customer_lastname: 'dsdfsf',
          o_c_related_customer_familyname: 'dsfs',
          o_c_related_customer_isforeign: 0,
          o_c_related_customer_civid_id: 'ydhdysd ',
          o_c_related_customer_regnum: 'dsf',
          o_c_related_customer_relation: 'ds',
          o_c_related_customer_isfinancial_onus: 0
        }
      ],
      o_c_customer_bank_relation: 'dfvsfs'
    },
    o_c_loan_information: [
      {
        '-action': '',
        o_c_loan_contract_date: '2000-11-11 12:12:02',
        o_c_loan_contractno: 'dfdfdfdf',
        o_c_loan_contract_change_reason: 'sdsfsfsf',
        o_c_loan_amount: '1255.23',
        o_c_loan_collateral_indexes: [],
        o_c_loan_related_org_indexes: [],
        o_c_loan_related_customer_indexes: [],
        o_c_loan_balance_lcy: '123231',
        o_c_loan_balance_fcy: 1234,
        o_c_loan_interest_balance_lcy: 111.12,
        o_c_loan_interest_balance_fcy: 12344,
        o_c_loan_additional_interest_balance_lcy: 111.12,
        o_c_loan_additional_interest_balance_fcy: 111.22,
        o_c_loan_currency_rate: '133.12',
        o_c_loan_loan_provenance: 'dsdsd',
        o_c_loan_bond_market: 'dsds',
        o_c_loan_numof_bonds: 1234,
        o_c_loan_bond_unit_price: '123133',
        o_c_loan_starteddate: '1995-09-09 12:12:03',
        o_c_loan_expdate: '1995-09-09',
        o_c_loan_status: 'dsdsdsd',
        o_c_loan_decide_status: 'dsdsdsd',
        o_c_loan_paiddate: '2000-12-12',
        o_c_loan_currency: 'dsd',
        o_c_loan_sector: 'sdds',
        o_c_loan_interest_rate: 12.32,
        o_c_loan_additional_interest_rate: 121212.23,
        o_c_loan_commission: 1221.32,
        o_c_loan_fee: 8585.32,
        o_c_loan_class: 'ddds',
        o_c_loan_type: 'sdsd',
        o_c_loan_line_contractno: 'dsdsdee',
        o_c_loan_transactions: {
          o_c_loan_schedule_type: 'dsds',
          o_c_loan_schedule_status: 0,
          o_c_loan_schedule_change_reason: 'dsdsd',
          o_c_loan_schedule: [
            {
              '-action': '',
              o_c_schedule_due_date: '2015-03-17',
              o_c_schedule_principal: 1234.12,
              o_c_schedule_interest: 123.12,
              o_c_schedule_additional: 111.12,
              o_c_schedule_balance: 56.32
            }
          ],
          o_c_loan_payment: [
            {
              o_c_payment_due_date: '2015-03-17',
              o_c_payment_date: '2015-03-17',
              o_c_payment_principal: 12.22,
              o_c_payment_interest: 11.32,
              o_c_payment_additional: 123.32
            }
          ]
        }
      }
    ],
    o_c_loanline: [
      {
        o_c_loanline_contract_date: '2015-03-17',
        o_c_loanline_contractno: 'dssf',
        o_c_loanline_contract_change_reason: 'fdfd',
        o_c_loanline_type: 'fdfdf',
        o_c_loanline_advamount_lcy: 45455.23,
        o_c_loanline_advamount_fcy: 123.23,
        o_c_loanline_starteddate: '2000-06-06 12:12:12',
        o_c_loanline_expdate: '2000-06-06',
        o_c_loanline_currency: 'dsdsd',
        o_c_loanline_currency_rate: 12.33,
        o_c_loanline_sector: 'dsd',
        o_c_loanline_interest_rate: 12.33,
        o_c_loanline_commitment_interest_rate: 12.33,
        o_c_loanline_balance: 23.32,
        o_c_loanline_paiddate: '2000-06-06',
        o_c_loanline_status: 'sss'
      }
    ],
    o_c_coll_information: [
      {
        '-action': '',
        o_c_coll_index: 121312,
        o_c_coll_internalno: 'dfd',
        o_c_coll_contractno: 'fdf',
        o_c_coll_type: 'dsds',
        o_c_coll_description: 'ds d s',
        o_c_coll_valuation_date: '1996-09-05',
        o_c_coll_value: 123.32,
        o_c_coll_max_value: 123.25,
        o_c_coll_address: 'sdsds',
        o_c_coll_zipcode: 1234,
        o_c_coll_is_real_estate: 0,
        o_c_coll_state_registration: {
          o_c_coll_certificateno: 'fafsdf',
          o_c_coll_state_regnum: 'sfdf',
          o_c_coll_registered_date: '1996-09-05',
          o_c_coll_confirmed_date: '1996-09-05'
        },
        o_c_coll_other_registration: {
          o_c_coll_other_certificateno: 'fs dfsfs',
          o_c_coll_other_regnum: 'fsfsfs',
          o_c_coll_other_name: 'dfdf',
          o_c_coll_other_registered_date: '1996-09-05'
        },
        o_c_coll_customer: {
          o_c_coll_customer_firstname: 'dsd',
          o_c_coll_customer_lastname: 'sdsd',
          o_c_coll_customer_isforeign: 0,
          o_c_coll_customer_civil_id: 'sdsd',
          o_c_coll_customer_regnum: 'sdsd'
        },
        o_c_coll_org: {
          o_c_coll_org_name: 'dsd',
          o_c_coll_org_islocal: 0,
          o_c_coll_org_regnum: 'dsd',
          o_c_coll_org_state_regnum: 'dsd'
        }
      }
    ]
  }
];
//#endregion example data

const zmsMutations = {
  /**
   * Creates a new zmsDictionary
   */

  async createZms() {
    const result = await zmsListValidator(zmsList);
    if (result.length > 0) {
      return result;
    } else {
      const zmsResult = await Zmss.insertMany(zmsList);

      zmsResult.forEach(mur => {
        ZmsLogs.create({
          createdAt: new Date(),
          ipAddress: '123.12.12.12',
          zmsId: mur._id,
          action: 'update',
          object: mur,
          status: true,
          sentDate: new Date(),
          sentBy: 'miiga',
          response: ''
        });
      });

      return zmsResult;
    }
  },

  /**
   * Creates a new zmsDictionary
   */

  async createZmsDictionary(_root, { ...doc }, _context: IContext) {
    return ZmsDictionaries.create(doc);
  },

  /**
   * Edit zmsDictionary
   */

  async zmsDictionaryEdit(_root, { _id, ...doc }, _context: IContext) {
    await ZmsDictionaries.updateOne({ _id }, { $set: doc });
    const updatedData = await ZmsDictionaries.findOne({ _id });
    return updatedData;
  },

  /**
   * Remove zmsDictionary
   */

  zmsDictionaryRemove: async (_root, { _id }) => {
    const deleteDate = await ZmsDictionaries.deleteOne({ _id: _id });
    return deleteDate;
  }
};

export default zmsMutations;
