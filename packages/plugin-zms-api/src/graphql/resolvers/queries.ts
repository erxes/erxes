import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries, ZmsLogs, Zmss } from '../../models';
import { InquireApi } from '../../zms/api/getRefer';
import { SupplyApi } from '../../zms/api/supply';

const zmsQueries = {
  async getZmsDictionary(_root, { _id }, _context: IContext) {
    return ZmsDictionaries.findOne({ _id });
  },

  async getDictionaries(_root, { isParent, parentId }, _context: IContext) {
    const query: any = { isParent: isParent ? true : { $ne: true } };
    if (parentId) {
      query.parentId = parentId;
    }
    const dictionaries = await ZmsDictionaries.find(query).lean();
    return dictionaries;
  },

  async getZms(_root, { _id }, _context: IContext) {
    return Zmss.findOne({ _id });
  },

  async getZmses() {
    const zmss = await Zmss.find({}).lean();
    return zmss;
  },

  async getInquire(
    _root,
    {
      typeInquire,
      keyword,
      reportPurpose,
      organizationType,
      foreignCitizen,
      resultType,
      liveStockYear
    }
  ) {
    const refer = await new InquireApi({
      client_id: 'br-5aec0f50-a214-40df-ab3a-e15d99790e79',
      secretKey: 'HZGkwzWt2j8YlWCh97xAKBrwmHEMkr7a'
    });
    const inquiries = await refer.getInquire({
      typeInquire,
      keyword,
      reportPurpose,
      organizationType,
      resultType,
      foreignCitizen,
      liveStockYear
    });
    return inquiries;
  },

  async getSupply() {
    const refer = await new SupplyApi({
      client_id: 'br-5aec0f50-a214-40df-ab3a-e15d99790e79',
      secretKey: 'HZGkwzWt2j8YlWCh97xAKBrwmHEMkr7a'
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
              o_c_loanline: [
                {
                  o_c_loanline_type: '03',
                  o_c_loanline_advamount: 183000.0,
                  o_c_loanline_starteddate: '2023-11-20 20:19:47',
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
                  o_c_loanline_type: '03',
                  o_c_loanline_advamount: 183000.0,
                  o_c_loanline_starteddate: '2023-11-20 20:19:47',
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
        }
      ]
    };
    const supply = await refer.checkSupply(data);
    return supply;
  }
};
export default zmsQueries;
