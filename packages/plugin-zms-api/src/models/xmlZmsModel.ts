import { Schema } from 'mongoose';
import { Zmss } from '.';

interface o_orgrate {
  o_fitchrating: string; // attachment П
  o_sandp_rating: string; // attachment Р
  o_moodysrating: string; // attachment С
}
interface o_shareholderorg {
  action: string;
  o_shareholder_orgname: string;
  o_shareholderorg_isforeign: boolean;
  o_shareholderorg_registerno: string;
  o_shareholder_stateregisterno: string;
  o_shareholder_sectorcode: string;
  o_shareholdercustomer: [o_shareholdercustomer];
}
interface o_shareholdercustomer {
  action: string;
  o_shareholder_firstname: string;
  o_shareholder_lastname: string;
  o_shareholdercus_isforeign: string;
  o_shareholdercus_registerno: string;
}
interface o_c_relationorg {
  action: string;
  o_c_relationorg_orgname: string;
  o_c_relationorg_isforeign: boolean;
  o_c_relationorg_registerno: string;
  o_c_relationorg_sectorcode: string;
  o_c_relationorg_stateregisterno: number;
  o_c_relationorg_orgrelation: string;
  o_c_relationorg_isfinancialonus: boolean;
  o_c_relationorg_relno: string;
  o_c_relationcustomer: [o_c_relationcustomer];
}
interface o_c_relationcustomer {
  action: string;
  o_c_relationcustomer_firstName: string;
  o_c_relationcustomer_lastName: string;
  o_c_relationcustomer_isforeign: boolean;
  o_c_relationcustomer_registerno: string;
  o_c_relationcustomer_citizen_relation: string;
  o_c_relationcustomer_isfinancialonus: boolean;
  o_c_relationcustomer_relno: string;
}
interface o_c_loanline {
  action: string;
  o_c_loanline_type: string;
  o_c_loanline_cardno: number;
  o_c_loanline_advamount: number;
  o_c_loanline_starteddate: Date;
  o_c_loanline_expdate: Date;
  o_c_loanline_currencycode: string;
  o_c_loanline_sectorcode: string;
  o_c_loanline_loaninterest: number;
  o_c_loanline_timestoloan: number;
  o_c_loanline_extdate: Date;
  o_c_loanline_interestinperc: number;
  o_c_loanline_commissionperc: number;
  o_c_loanline_fee: string;
  o_c_loanline_loanclasscode: string;
  o_c_loanline_balance: number;
  o_c_loanline_isapproved: boolean;
}
interface o_c_loanmrtno {
  action: string;
  o_c_loan_balance: number;
  o_c_loan_loanProvenance: string;
  o_c_loan_starteddate: Date;
  o_c_loan_expdate: Date;
  o_c_loan_currencycode: string;
  o_c_loan_sectorcode: string;
  o_c_loan_interestinperc: number;
  o_c_loan_commissionperc: number;
  o_c_loan_fee: number;
  o_c_loan_extdate: Date;
  o_c_loan_updatedexpdate: Date;
  o_c_loan_loanclasscode: string;
  o_c_loan_isapproved: boolean;
  o_c_loanrelnos: [o_c_loanrelno];
  o_c_loan_loanintype: string;
  o_c_loantransactions: [o_c_loantransaction];
}
interface o_c_loanrelno {
  c_loan_orgmeasure: string;
  c_loan_measuredate: Date;
  c_loan_measuredescription: string;
  c_loan_causetostartcase: string;
  o_c_loan_datetstartcase: Date;
  o_c_loan_registertopolice: boolean;
  o_c_loan_registertopolicedate: Date;
  o_c_loan_timesinpolice: number;
  o_c_loan_registertoprocuror: boolean;
  o_c_loan_registertoprocurordate: Date;
  o_c_loan_timesinprocuror: number;
  o_c_loan_registertocourt: boolean;
  o_c_loan_registertocourtdate: Date;
  o_c_loan_timesincourt: number;
  o_c_loan_shiftocourt2: boolean;
  o_c_loan_shifttocourt2date: Date;
  o_c_loan_timesincourt2: number;
  o_c_loan_shiftocourtdecision: boolean;
  o_c_loan_shifttocourtdecisiondate: Date;
  o_c_loan_ignoredcrime: boolean;
  o_c_loan_ignoreddate: Date;
  o_c_loan_courtorderno: string;
}
interface o_c_loantransaction {
  o_c_loan_loancharttype: string;
  o_c_loandetails: [o_c_loandetail];
  o_c_loanperformances: [o_c_loanperformance];
  o_c_loan_interestcharttype: string;
  o_c_loaninterestdetails: [o_c_loaninterestdetail];
}
interface o_c_loandetail {
  o_c_loandetail_datetopay: Date;
  o_c_loandetail_amounttopay: number;
}
interface o_c_loanperformance {
  o_c_loanperformance_datetopay: Date;
  o_c_loanperformance_amounttopay: number;
}
interface o_c_loaninterestdetail {
  action: string;
  o_c_loaninterestdetail_datetopay: Date;
  o_c_loaninterestdetail_amounttopay: number;
  o_c_loaninterestperformances: [o_c_loaninterestperformance];
}
interface o_c_loaninterestperformance {
  action: string;
  o_c_loaninterestperformance_datetopay: Date;
  o_c_loaninterestperformance_amounttopay: number;
}
interface o_c_leasing {
  action: string;
  o_c_leasing_advamount: number;
  o_c_leasing_balance: number;
  o_c_leasing_isapproved: boolean;
  o_c_leasing_starteddate: Date;
  o_c_leasing_expdate: Date;
  o_c_leasing_currencycode: string;
  o_c_leasing_sectorcode: string;
  o_c_leasing_interestinperc: number;
  o_c_leasing_commissionperc: number;
  o_c_leasing_fee: number;
  o_c_leasing_updatedexpdate: Date;
  o_c_leasing_loanclasscode: string;
  o_c_leasingrelnos: string;
  o_c_leasingtransactions: [o_c_leasingtransaction];
  leasing_neoinfo: leasing_neoinfo;
}
interface o_c_leasingtransaction {
  o_c_leasing_loancharttype: string;
  o_c_leasingdetails: [o_c_leasingdetail];
  o_c_leasingperformances: [o_c_leasingperformance];
  o_c_leasing_nterestcharttype: string;
  o_c_leasinginterestdetails: [o_c_leasinginterestdetail];
}
interface o_c_leasingdetail {
  action: string;
  o_c_leasingdetail_datetopay: Date;
  o_c_leasingdetail_amounttopay: number;
}
interface o_c_leasingperformance {
  action: string;
  o_c_leasingperformance_datetopay: Date;
  o_c_leasingperformance_amounttopay: number;
}
interface o_c_leasinginterestdetail {
  o_c_leasinginterestdetail_datetopay: Date;
  o_c_leasinginterestdetail_amounttopay: number;
  o_c_leasinginterestperformances: [o_c_leasinginterestperformance];
}
interface o_c_leasinginterestperformance {
  o_c_leasinginterestperformance_datetopay: Date;
  o_c_leasinginterestperformance_amounttopay: number;
}
interface leasing_neoinfo {
  action: string;
  c_leasing_orgmeasure: string;
  c_leasing_measuredate: Date;
  c_leasing_measuredescription: string;
  c_leasing_causetostartcase: string;
  c_leasing_datetstartcase: Date;
  o_c_leasing_registertopolice: boolean;
  o_c_leasing_registertopolicedate: Date;
  o_c_leasing_timesinpolice: number;
  o_c_leasing_registertoprocuror: boolean;
  o_c_leasing_registertoprocurordate: Date;
  o_c_leasing_timesinprocuror: number;
  o_c_leasing_registertocourt: boolean;
  o_c_leasing_registertocourtdate: Date;
  o_c_leasing_timesincourt: number;
  o_c_leasing_shiftocourt2: boolean;
  o_c_leasing_shifttocourt2date: Date;
  o_c_leasing_timesincourt2: number;
  o_c_leasing_shiftocourtdecision: boolean;
  o_c_leasing_shifttocourtdecisiondate: Date;
  o_c_leasing_ignoredcrime: boolean;
  o_c_leasing_ignoreddate: Date;
  o_c_leasing_courtorderno: string;
}
interface o_c_accreditmrtno {
  action: string;
  o_c_accredit_advamount: number;
  o_c_accredit_starteddate: Date;
  o_c_accredit_expdate: Date;
  o_c_accredit_currencycode: string;
  o_c_accredit_type: string;
  o_c_accredit_sectorcode: string;
  o_c_accredit_interestinperc: number;
  o_c_accredit_commissionperc: number;
  o_c_accredit_fee: number;
  o_c_accredit_updatedexpdate: Date;
  o_c_accredit_extcount: number;
  o_c_accredit_balance: number;
  o_c_accredit_isapproved: boolean;
}
interface o_c_onus_information {
  action: string;
  o_c_loan_provideLoanSize: number;
  o_c_loanline: [o_c_loanline];
  o_c_loanmrtnos: [o_c_loanmrtno];
  o_c_leasing: [o_c_leasing];
  o_c_accredit: [o_c_accreditmrtno];
  o_c_loanrelnos: [o_c_loanrelno];
}
interface o_c_mortgage_information {
  o_c_mortgage: {
    action: string;
    o_c_mrtno: string;
    o_c_mrtno_internal: string;
    o_c_mrtcode: string;
    o_c_mrtdescription: string;
    o_c_is_real_estate: boolean;
    o_c_dateofvaluation: Date;
    o_c_mrtvalue: number;
    o_c_mrtmaxlimit: number;
    o_c_mrt_address: string;
    o_c_registeredtoauthority: o_c_registeredtoauthority;
    o_c_customer: o_c_customer;
  };
}
interface o_c_registeredtoauthority {
  o_c_mrtregistereddate: Date;
  o_c_mrtstateregisterno: string;
  o_c_mrtcertificateno: string;
  o_c_mrtconfirmeddate: Date;
}
interface o_c_customer {
  o_c_customer_firstname: string;
  o_c_customer_lastname: string;
  o_c_customer_isforeign: string;
  o_c_customer_registerno: string;
}

export interface IXmlZms {
  customer: {
    action: string;
    response: string;
    o_c_customer_information: {
      action: string;
      o_c_customercode: string;
      o_c_bankCode: string;
      o_c_branchcode: string;
      o_c_isorganization: boolean;
      o_c_birthdate: Date;
      o_c_customername: string;
      c_lastname: string;
      o_c_isforeign: boolean;
      o_c_zipcode: number;
      o_c_address: string;
      o_c_registerno: string;
      o_c_stateregister_passportorno: string;
      o_c_customer_bankrelations: string; // хавсрал З болон И нэгтгэх
      c_familynumofmembers: number;
      c_familynumofunemployed: number;
      c_job: string;
      c_occupation: string;
      o_companytypecode: string;
      o_orgrate: o_orgrate;
      o_shareholderorgs: [o_shareholderorg];
      o_c_relationorg: [o_c_relationorg];
      o_c_president_family_firstname: string;
      o_c_president_family_lastname: string;
      o_c_president_family_isforeign: string;
      o_c_president_family_registerno: string;
    };
    o_c_onus_information: o_c_onus_information;
    o_c_mortgage_information: [o_c_mortgage_information];
  };
}

export const xmlZmsSchema = new Schema<IXmlZms>({
  customer: {
    response: String,
    action: String,
    o_c_customer_information: {
      action: String,
      o_c_customercode: String,
      o_c_bankCode: String,
      o_c_branchcode: String,
      o_c_isorganization: Boolean,
      o_c_customername: String,
      c_lastname: String,
      o_c_isforeign: Boolean,
      o_c_birthdate: Date,
      o_c_address: String,
      o_c_zipcode: Number,
      o_c_registerno: String,
      o_c_stateregister_passportorno: String,
      o_c_customer_bankrelations: String, // хавсрал З болон И нэгтгэх
      c_familynumofunemployed: String,
      c_job: String,
      c_occupation: String,
      //legal
      o_companytypecode: String, //attachment Ж
      o_orgrate: {
        o_fitchrating: String, // attachment П
        o_sandp_rating: String, // attachment Р
        o_moodysrating: String // attachment С
      },
      o_shareholderorgs: [
        {
          action: String,
          o_shareholder_orgname: String,
          o_shareholderorg_isforeign: Boolean,
          o_shareholderorg_registerno: String,
          o_shareholder_stateregisterno: String,
          o_shareholder_sectorcode: String,
          o_shareholdercustomers: [
            {
              action: String,
              o_shareholder_firstname: String,
              o_shareholder_lastname: String,
              o_shareholdercus_isforeign: String,
              o_shareholdercus_registerno: String
            }
          ]
        }
      ],
      o_c_relationorgs: [
        {
          action: String,
          o_c_relationorg_orgname: String,
          o_c_relationorg_isforeign: Boolean,
          o_c_relationorg_registerno: String,
          o_c_relationorg_sectorcode: String,
          o_c_relationorg_stateregisterno: Number,
          o_c_relationorg_orgrelation: String,
          o_c_relationorg_isfinancialonus: Boolean,
          o_c_relationorg_relno: String,
          o_c_relationcustomers: [
            {
              action: String,
              o_c_relationcustomer_firstName: String,
              o_c_relationcustomer_lastName: String,
              o_c_relationcustomer_isforeign: Boolean,
              o_c_relationcustomer_registerno: String,
              o_c_relationcustomer_citizen_relation: String,
              o_c_relationcustomer_isfinancialonus: Boolean,
              o_c_relationcustomer_relno: String
            }
          ]
        }
      ],
      o_c_president_family_firstname: String,
      o_c_president_family_lastname: String,
      o_c_president_family_isforeign: String,
      o_c_president_family_registerno: String
    },
    o_c_onus_information: {
      action: String,
      o_c_loan_provideLoanSize: Number,
      o_c_loanline: [
        {
          action: String,
          o_c_loanline_type: String,
          o_c_loanline_cardno: Number,
          o_c_loanline_advamount: Number,
          o_c_loanline_starteddate: Date,
          o_c_loanline_expdate: Date,
          o_c_loanline_currencycode: String,
          o_c_loanline_sectorcode: String,
          o_c_loanline_loaninterest: Number,
          o_c_loanline_timestoloan: Number,
          o_c_loanline_extdate: Date,
          o_c_loanline_interestinperc: Number,
          o_c_loanline_commissionperc: Number,
          o_c_loanline_fee: String,
          o_c_loanline_loanclasscode: String,
          o_c_loanline_balance: Number,
          o_c_loanline_isapproved: Boolean
        }
      ],
      o_c_loanmrtnos: [
        {
          o_c_loan_balance: Number,
          o_c_loan_loanProvenance: String,
          o_c_loan_advamount: Number,
          o_c_loan_starteddate: Date,
          o_c_loan_expdate: Date,
          o_c_loan_currencycode: String,
          o_c_loan_sectorcode: String,
          o_c_loan_interestinperc: Number,
          o_c_loan_commissionperc: Number,
          o_c_loan_fee: Number,
          o_c_loan_extdate: Date,
          o_c_loan_updatedexpdate: Date,
          o_c_loan_loanclasscode: String,
          o_c_loan_isapproved: Boolean,
          o_c_loanrelnos: {
            c_loan_orgmeasure: String,
            c_loan_measuredate: Date,
            c_loan_measuredescription: String,
            c_loan_causetostartcase: String,
            o_c_loan_datetstartcase: Date,
            o_c_loan_registertopolice: Boolean,
            o_c_loan_registertopolicedate: Date,
            o_c_loan_timesinpolice: Number,
            o_c_loan_registertoprocuror: Boolean,
            o_c_loan_registertoprocurordate: Date,
            o_c_loan_timesinprocuror: Number,
            o_c_loan_registertocourt: Boolean,
            o_c_loan_registertocourtdate: Date,
            o_c_loan_timesincourt: Number,
            o_c_loan_shiftocourt2: Boolean,
            o_c_loan_shifttocourt2date: Date,
            o_c_loan_timesincourt2: Number,
            o_c_loan_shiftocourtdecision: Boolean,
            o_c_loan_shifttocourtdecisiondate: Date,
            o_c_loan_ignoredcrime: Boolean,
            o_c_loan_ignoreddate: Date,
            o_c_loan_courtorderno: String
          },
          o_c_loan_loanintype: String,
          o_c_loantransactions: [
            {
              o_c_loan_loancharttype: String,
              o_c_loandetails: [
                {
                  o_c_loandetail_datetopay: Date,
                  o_c_loandetail_amounttopay: Number
                }
              ],
              o_c_loanperformancess: [
                {
                  o_c_loanperformance_datetopay: Date,
                  o_c_loanperformance_amounttopay: Number
                }
              ],
              o_c_loan_interestcharttype: String,
              o_c_loaninterestdetails: [
                {
                  action: String,
                  o_c_loaninterestdetail_datetopay: Date,
                  o_c_loaninterestdetail_amounttopay: Number,
                  o_c_loaninterestperformances: [
                    {
                      action: String,
                      o_c_loaninterestperformance_datetopay: Date,
                      o_c_loaninterestperformance_amounttopay: Number
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      o_c_leasing: [
        {
          action: String,
          o_c_leasing_advamount: Number,
          o_c_leasingmrtnos: [
            {
              o_c_leasing_balance: Number,
              o_c_leasing_isapproved: Boolean,
              o_c_leasing_starteddate: Date,
              o_c_leasing_expdate: Date,
              o_c_leasing_currencycode: String,
              o_c_leasing_sectorcode: String,
              o_c_leasing_interestinperc: Number,
              o_c_leasing_commissionperc: Number,
              o_c_leasing_fee: Number,
              o_c_leasing_updatedexpdate: Date,
              o_c_leasing_loanclasscode: String
            }
          ],
          o_c_leasingrelnos: String,
          o_c_leasingtransactions: [
            {
              o_c_leasing_loancharttype: String,
              o_c_leasingdetails: [
                {
                  action: String,
                  o_c_leasingdetail_datetopay: Date,
                  o_c_leasingdetail_amounttopay: Number
                }
              ],
              o_c_leasingperformances: [
                {
                  action: String,
                  o_c_leasingperformance_datetopay: Date,
                  o_c_leasingperformance_amounttopay: Number
                }
              ],
              o_c_leasing_nterestcharttype: String,
              o_c_leasinginterestdetails: [
                {
                  o_c_leasinginterestdetail_datetopay: Date,
                  o_c_leasinginterestdetail_amounttopay: Number,
                  o_c_leasinginterestperformances: [
                    {
                      o_c_leasinginterestperformance_datetopay: Date,
                      o_c_leasinginterestperformance_amounttopay: Number
                    }
                  ]
                }
              ]
            }
          ],
          leasing_neoinfo: {
            action: String,
            c_leasing_orgmeasure: String,
            c_leasing_measuredate: Date,
            c_leasing_measuredescription: String,
            c_leasing_causetostartcase: String,
            c_leasing_datetstartcase: Date,
            o_c_leasing_registertopolice: Boolean,
            o_c_leasing_registertopolicedate: Date,
            o_c_leasing_timesinpolice: Number,
            o_c_leasing_registertoprocuror: Boolean,
            o_c_leasing_registertoprocurordate: Date,
            o_c_leasing_timesinprocuror: Number,
            o_c_leasing_registertocourt: Boolean,
            o_c_leasing_registertocourtdate: Date,
            o_c_leasing_timesincourt: Number,
            o_c_leasing_shiftocourt2: Boolean,
            o_c_leasing_shifttocourt2date: Date,
            o_c_leasing_timesincourt2: Number,
            o_c_leasing_shiftocourtdecision: Boolean,
            o_c_leasing_shifttocourtdecisiondate: Date,
            o_c_leasing_ignoredcrime: Boolean,
            o_c_leasing_ignoreddate: Date,
            o_c_leasing_courtorderno: String
          }
        }
      ],
      o_c_accredit: [
        {
          action: String,
          o_c_accredit_advamount: Number,
          o_c_accredit_starteddate: Date,
          o_c_accredit_expdate: Date,
          o_c_accredit_currencycode: String,
          o_c_accredit_type: String,
          o_c_accredit_sectorcode: String,
          o_c_accredit_interestinperc: Number,
          o_c_accredit_commissionperc: Number,
          o_c_accredit_fee: Number,
          o_c_accredit_updatedexpdate: Date,
          o_c_accredit_extcount: Number,
          o_c_accredit_balance: Number,
          o_c_accredit_isapproved: Boolean
        }
      ],
      o_c_loanrelnos: {
        action: String,
        c_loan_orgmeasure: String,
        c_loan_measuredate: Date,
        c_loan_measuredescription: String,
        c_loan_causetostartcase: String,
        o_c_loan_datetstartcase: Date,
        o_c_loan_registertopolice: Boolean,
        o_c_loan_registertopolicedate: Date,
        o_c_loan_timesinpolice: Number,
        o_c_loan_registertoprocuror: Boolean,
        o_c_loan_registertoprocurordate: Date,
        o_c_loan_timesinprocuror: Number,
        o_c_loan_registertocourt: Boolean,
        o_c_loan_registertocourtdate: Date,
        o_c_loan_timesincourt: Number,
        o_c_loan_shiftocourt2: Boolean,
        o_c_loan_shifttocourt2date: Date,
        o_c_loan_timesincourt2: Number,
        o_c_loan_shiftocourtdecision: Boolean,
        o_c_loan_shifttocourtdecisiondate: Date,
        o_c_loan_ignoredcrime: Boolean,
        o_c_loan_ignoreddate: Date,
        o_c_loan_courtorderno: String
      }
    },
    o_c_mortgage_information: [
      {
        o_c_mortgage: {
          action: String,
          o_c_mrtno: Number,
          o_c_mrtno_internal: Number,
          o_c_mrtcode: Number,
          o_c_mrtdescription: Number,
          o_c_is_real_estate: Number,
          o_c_dateofvaluation: Date,
          o_c_mrtvalue: Number,
          o_c_mrtmaxlimit: Number,
          o_c_mrt_address: String,
          o_c_registeredtoauthority: {
            o_c_mrtregistereddate: Date,
            o_c_mrtstateregisterno: String,
            o_c_mrtcertificateno: String,
            o_c_mrtconfirmeddate: String
          },
          o_c_customer: {
            o_c_customer_firstname: String,
            o_c_customer_lastname: String,
            o_c_customer_isforeign: Boolean,
            o_c_customer_registerno: String
          }
        }
      }
    ]
  }
});

export const loadZmsClass = () => {
  class xmlZms {
    public static async getZms(_id: string) {
      const zms = await Zmss.findOne({ _id });

      if (!zms) {
        throw new Error('Zms not found');
      }

      return zms;
    }

    // create zms
    public static async createZms(doc) {
      return Zmss.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  xmlZmsSchema.loadClass(xmlZms);

  return xmlZmsSchema;
};
