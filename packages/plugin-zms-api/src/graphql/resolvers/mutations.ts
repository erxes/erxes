import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries } from '../../models';
import { SupplyApi } from '../../zms/api/supply';
import { getConfig } from '../../messageBroker';

const zmsMutations = {
  async sendZms(_root, { ...doc }, { subdomain }: any) {
    const config = await getConfig('zmsConfig', subdomain, '');
    const refer = new SupplyApi({
      client_id: config.client_id,
      secretKey: config.secretKey
    });
    const data: any = {
      customers: [
        {
          customer: {
            o_c_customer_information: {
              o_c_customercode: '01КЪ10111213',
              o_c_bankCode: 'ochirundraa00',
              o_c_branchcode: 'ochirundraa01',
              o_c_isorganization: 1,
              o_c_birthdate: '1999-05-05',
              o_c_customername: 'bat',
              c_lastname: 'batin bat',
              o_c_isforeign: 0,
              o_c_zipcode: 12121,
              o_c_address: 'zaa medehgveee bro',
              o_c_registerno: 'КЪ10111213',
              o_c_stateregister_passportorno: 'КЪ10111213',
              o_c_customer_bankrelations: '05'
            },
            o_c_onus_information: {
              o_c_accredit: [
                {
                  o_c_accredit_advamount: 1000000.0,
                  o_c_accredit_starteddate: '2024-11-20 20:19:47',
                  o_c_accredit_expdate: '2018-08-20 10:19:47',
                  o_c_accredit_currencycode: 'MNT',
                  o_c_accredit_type: '02',
                  o_c_accredit_sectorcode: 'G47',
                  o_c_accredit_interestinperc: 1.9,
                  o_c_accredit_commissionperc: 9.9,
                  o_c_accredit_fee: 0.0,
                  o_c_accredit_updatedexpdate: '2018-08-20 10:19:47',
                  o_c_accredit_extcount: 10,
                  o_c_accredit_balance: 10,
                  o_c_accredit_isapproved: 0
                }
              ]
            },
            o_c_mortgage_information: {
              o_c_mortgage: {
                o_c_mrtno: 25,
                o_c_mrtno_internal: 12314567,
                o_c_mrtcode: '0101',
                o_c_mrtdescription: 50555511214,
                o_c_is_real_estate: 0,
                o_c_dateofvaluation: '2018-08-20',
                o_c_mrtvalue: 229000000315.56,
                o_c_mrtmaxlimit: 18340052.45,
                o_c_mrt_address: 'Архангай Эрдэнэбулган сум Баг 4',
                o_c_registeredtoauthority: {
                  o_c_mrtregistereddate: '2018-08-20',
                  o_c_mrtstateregisterno: 'ҮҮ223421',
                  o_c_mrtcertificateno: 'ҮҮ223421',
                  o_c_mrtconfirmeddate: '2018-08-20'
                },
                o_c_customer: {
                  o_c_customer_firstname: 'Магнайбаяр',
                  o_c_customer_isforeign: 0,
                  o_c_customer_registerno: 'КЪ10111213'
                }
              }
            }
          }
        },
        {
          customer: {
            o_c_customer_information: {
              o_c_customercode: '01УУ01010102',
              o_c_bankCode: 'ochirundraa00',
              o_c_branchcode: 'ochirundraa01',
              o_c_isorganization: 1,
              o_c_birthdate: '1999-05-05',
              o_c_customername: 'bat',
              c_lastname: 'batin bat',
              o_c_isforeign: 0,
              o_c_zipcode: 12121,
              o_c_address: 'zaa medehgveee bro',
              o_c_registerno: 'УУ01010102',
              o_c_stateregister_passportorno: 'УУ01010102',
              o_c_customer_bankrelations: '05'
            },
            o_c_onus_information: {
              o_c_loanline: [
                {
                  o_c_loanline_type: '03',
                  o_c_loanline_advamount: 103000.0,
                  o_c_loanline_starteddate: '2002-11-20 20:19:47',
                  o_c_loanline_expdate: '2018-08-20 10:19:47',
                  o_c_loanline_currencycode: 'MNT',
                  o_c_loanline_sectorcode: 'G47',
                  o_c_loanline_loanclasscode: '01',
                  o_c_loanline_loaninterest: 9.9,
                  o_c_loanline_timestoloan: 1,
                  o_c_loanline_interestinperc: 1.9,
                  o_c_loanline_commissionperc: 9.9,
                  o_c_loanline_fee: 0.0,
                  o_c_loanline_balance: 1.0
                },
                {
                  o_c_loanline_type: '04',
                  o_c_loanline_advamount: 1899500.0,
                  o_c_loanline_starteddate: '2010-11-22 20:19:47',
                  o_c_loanline_expdate: '2019-08-21 10:19:47',
                  o_c_loanline_currencycode: 'MNT',
                  o_c_loanline_sectorcode: 'G47',
                  o_c_loanline_loanclasscode: '01',
                  o_c_loanline_loaninterest: 9.9,
                  o_c_loanline_timestoloan: 1,
                  o_c_loanline_interestinperc: 1.9,
                  o_c_loanline_commissionperc: 9.9,
                  o_c_loanline_fee: 0.0,
                  o_c_loanline_balance: 1.0
                }
              ],
              o_c_accredit: [
                {
                  o_c_accredit_advamount: 183000.0,
                  o_c_accredit_starteddate: '2003-11-20 20:19:47',
                  o_c_accredit_expdate: '2018-08-20 10:19:47',
                  o_c_accredit_currencycode: 'MNT',
                  o_c_accredit_type: '02',
                  o_c_accredit_sectorcode: 'G47',
                  o_c_accredit_interestinperc: 1.9,
                  o_c_accredit_commissionperc: 9.9,
                  o_c_accredit_fee: 0.0,
                  o_c_accredit_updatedexpdate: '2018-08-20 10:19:47',
                  o_c_accredit_extcount: 10,
                  o_c_accredit_balance: 10,
                  o_c_accredit_isapproved: 0
                }
              ]
            },
            o_c_mortgage_information: {
              o_c_mortgage: {
                o_c_mrtno: 25,
                o_c_mrtno_internal: 12314567,
                o_c_mrtcode: '0101',
                o_c_mrtdescription: 50555511214,
                o_c_is_real_estate: 0,
                o_c_dateofvaluation: '2018-08-20',
                o_c_mrtvalue: 229000000315.56,
                o_c_mrtmaxlimit: 18340052.45,
                o_c_mrt_address: 'Архангай Эрдэнэбулган сум Баг 4',
                o_c_registeredtoauthority: {
                  o_c_mrtregistereddate: '2018-08-20',
                  o_c_mrtstateregisterno: 'ҮҮ223421',
                  o_c_mrtcertificateno: 'ҮҮ223421',
                  o_c_mrtconfirmeddate: '2018-08-20'
                },
                o_c_customer: {
                  o_c_customer_firstname: 'Магнайбаяр',
                  o_c_customer_isforeign: 0,
                  o_c_customer_registerno: 'УУ01010102'
                }
              }
            }
          }
        }
      ]
    };
    const supply = refer.checkSupply(data);
    return supply;
  },

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
