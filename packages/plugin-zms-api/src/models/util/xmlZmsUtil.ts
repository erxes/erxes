import { IXmlZms } from '../../models/xmlZmsModel';

type Validation = {
  field: string;
  regex?: RegExp;
  isRequired?: boolean;
  childrens?: Validation[];
};
const stringRegex = (to: number = 50) =>
  new RegExp(`^[a-zA-Zа-яА-Я0-9ёЁөӨүҮЪъЬь -]{1,${to}}$`);
const registerRegex = /^[a-zA-Zа-яА-ЯёЁөӨүҮ0-9]{1,16}$/;
const pureDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
const numberRegex = /^\d+$/;
const booleanRegex = /^[01]{1}$/;
const numberLimRegex = /^\d{1,10}$/;
const fullDateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1]) (2[0-3]|[01]\d):[0-5]\d:[0-5]\d$/;
const amountRegex = /^[+-]?\d+(\.\d+)?$/;

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
  zms: IXmlZms,
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
  zmsList: IXmlZms[],
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
    field: 'datapackageno',
    isRequired: false,
    regex: numberLimRegex
  },
  {
    field: 'customer',
    isRequired: true,
    childrens: [
      {
        field: 'o_c_customer_information',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_customercode',
            isRequired: true,
            regex: stringRegex(50)
          },
          {
            field: 'o_c_loandescription',
            isRequired: false,
            regex: stringRegex(250)
          },
          {
            field: 'o_c_bankCode',
            isRequired: false,
            regex: stringRegex(10)
          },
          {
            field: 'o_c_branchcode',
            isRequired: false,
            regex: stringRegex(10)
          },
          {
            field: 'o_c_isorganization',
            isRequired: true,
            regex: booleanRegex
          },
          {
            field: 'o_c_customername',
            isRequired: true,
            regex: stringRegex(100)
          },
          {
            field: 'c_lastname',
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
            field: 'o_c_zipcode',
            isRequired: false,
            regex: numberLimRegex
          },
          {
            field: 'o_c_address',
            isRequired: true,
            regex: stringRegex(300)
          },
          {
            field: 'o_c_sectorcodes',
            isRequired: false,
            childrens: [
              {
                field: 'o_c_numofemployee',
                isRequired: false,
                regex: numberLimRegex
              }
            ]
          },
          {
            field: 'o_c_stateregister_passportorno',
            isRequired: false,
            regex: registerRegex
          },
          {
            field: 'c_familynumofmembers',
            isRequired: false,
            regex: numberLimRegex
          },
          {
            field: 'c_familynumofunemployed',
            isRequired: false,
            regex: numberLimRegex
          },
          {
            field: 'c_job',
            isRequired: false,
            regex: stringRegex(250)
          },
          {
            field: 'c_occupation',
            isRequired: false,
            regex: stringRegex(250)
          },
          {
            field: 'o_orgrate',
            isRequired: false,
            children: [
              {
                field: 'o_fitchrating',
                isRequired: false,
                regex: stringRegex()
              },
              {
                field: 'o_sandp_rating',
                isRequired: false,
                regex: stringRegex()
              },
              {
                field: 'o_moodysrating',
                isRequired: false,
                regex: stringRegex()
              }
            ]
          },
          {
            field: 'o_companytypecode',
            isRequired: true,
            regex: stringRegex()
          },
          {
            field: 'o_c_president_family_firstname',
            isRequired: false,
            regex: stringRegex()
          },
          {
            field: 'o_c_president_family_lastname',
            isRequired: false,
            regex: stringRegex()
          },
          {
            field: 'o_c_president_family_isforeign',
            isRequired: false,
            regex: booleanRegex
          },
          {
            field: 'o_c_president_family_registerno',
            isRequired: false,
            regex: booleanRegex
          },
          {
            field: 'o_c_customer_bankrelations',
            isRequired: true,
            regex: registerRegex
          }
        ]
      },
      {
        field: 'o_c_onus_information',
        isRequired: true,
        childrens: [
          {
            field: 'o_c_loanmrtnos',
            isRequired: false,
            childrens: [
              {
                field: 'o_c_loanmrtno',
                isRequired: false,
                childrens: [
                  {
                    field: 'o_c_loan_balance',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_loan_loanProvenance',
                    isRequired: true,
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
                    field: 'o_c_loan_currencycode',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_loan_sectorcode',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_loan_interestinperc',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_loan_commissionperc',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_loan_fee',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_loan_extdate',
                    isRequired: true,
                    regex: pureDateRegex
                  },
                  {
                    field: 'o_c_loan_updatedexpdate',
                    isRequired: true,
                    regex: pureDateRegex
                  },
                  {
                    field: 'o_c_loan_isapproved',
                    isRequired: false,
                    regex: booleanRegex
                  },
                  {
                    field: 'o_c_loan_loanintype',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_loantransactions',
                    isRequired: false,
                    childrens: [
                      {
                        field: 'o_c_loantransaction',
                        isRequired: false,
                        childrens: [
                          {
                            field: 'o_c_loan_loancharttype',
                            isRequired: true,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_loandetails',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_loandetail',
                                isRequired: false,
                                childrens: [
                                  {
                                    field: 'o_c_loandetail_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field: 'o_c_loandetail_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            field: 'o_c_loanperformances',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_loanperformance',
                                isRequired: false,
                                childrens: [
                                  {
                                    field: 'o_c_loanperformance_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field: 'o_c_loanperformance_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            field: 'o_c_loan_interestcharttype',
                            isRequired: false,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_loaninterestdetails',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_loaninterestdetail',
                                isRequired: false,
                                childrens: [
                                  {
                                    field: 'o_c_loaninterestdetail_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field: 'o_c_loaninterestdetail_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                  //o_c_loanrelnos:[o_c_loanrelno];
                ]
              }
            ]
          },
          {
            field: 'o_c_leasingmrtnos',
            isRequired: false,
            childrens: [
              {
                field: 'o_c_leasing_advamount',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_leasingmrtno',
                isRequired: false,
                childrens: [
                  {
                    field: 'o_c_leasing_balance',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_leasing_starteddate',
                    isRequired: true,
                    regex: fullDateRegex
                  },
                  {
                    field: 'o_c_leasing_expdate',
                    isRequired: true,
                    regex: pureDateRegex
                  },
                  {
                    field: 'o_c_leasing_currencycode',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_leasing_sectorcode',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_leasing_interestinperc',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_leasing_commissionperc',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_leasing_fee',
                    isRequired: true,
                    regex: amountRegex
                  },
                  {
                    field: 'o_c_loan_extdate',
                    isRequired: true,
                    regex: pureDateRegex
                  },
                  {
                    field: 'o_c_leasing_updatedexpdate',
                    isRequired: true,
                    regex: pureDateRegex
                  },
                  {
                    field: 'o_c_leasing_isapproved',
                    isRequired: false,
                    regex: booleanRegex
                  },
                  {
                    field: 'o_c_leasing_loanclasscode',
                    isRequired: true,
                    regex: stringRegex()
                  },
                  {
                    field: 'o_c_leasingtransactions',
                    isRequired: false,
                    childrens: [
                      {
                        field: 'o_c_leasingtransaction',
                        isRequired: false,
                        childrens: [
                          {
                            field: 'o_c_leasing_loancharttype',
                            isRequired: true,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_leasingdetails',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_leasingdetail',
                                isRequired: false,
                                childrens: [
                                  {
                                    field: 'o_c_leasingdetail_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field: 'o_c_leasingdetail_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            field: 'o_c_leasingperformances',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_leasingperformance',
                                isRequired: false,
                                childrens: [
                                  {
                                    field: 'o_c_leasingperformance_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field: 'o_c_leasingperformance_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            field: 'o_c_leasing_interestcharttype',
                            isRequired: false,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_leasinginterestdetails',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_leasinginterestdetail',
                                isRequired: false,
                                childrens: [
                                  {
                                    field:
                                      'o_c_leasinginterestdetail_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field:
                                      'o_c_leasinginterestdetail_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            field: 'o_c_leasinginterestperformances',
                            isRequired: false,
                            childrens: [
                              {
                                field: 'o_c_leasinginterestperformance',
                                isRequired: false,
                                childrens: [
                                  {
                                    field:
                                      'o_c_leasinginterestperformance_datetopay',
                                    isRequired: false,
                                    regex: pureDateRegex
                                  },
                                  {
                                    field:
                                      'o_c_leasinginterestperformance_amounttopay',
                                    isRequired: false,
                                    regex: amountRegex
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                  //o_c_loanrelnos:[o_c_loanrelno];
                ]
              }
            ]
          },
          {
            field: 'o_c_loanline',
            isRequired: false,
            childrens: [
              {
                field: 'o_c_loanline_type',
                isRequired: true,
                regex: stringRegex()
              },
              {
                field: 'o_c_loanline_cardno',
                isRequired: false,
                regex: numberRegex
              },
              {
                field: 'o_c_loanline_advamount',
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
                field: 'o_c_loanline_currencycode',
                isRequired: true,
                regex: stringRegex()
              },
              {
                field: 'o_c_loanline_sectorcode',
                isRequired: true,
                regex: stringRegex()
              },
              {
                field: 'o_c_loanline_loaninterest',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_loanline_timestoloan',
                isRequired: true,
                regex: numberLimRegex
              },
              {
                field: 'o_c_loanline_fee',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_loanline_extdate',
                isRequired: false,
                regex: pureDateRegex
              },
              {
                field: 'o_c_loanline_interestinperc',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_loanline_commissionperc',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_loanline_balance',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_loanline_isapproved',
                isRequired: false,
                regex: booleanRegex
              },
              {
                field: 'o_c_loanline_loanclasscode',
                isRequired: true,
                regex: stringRegex()
              }
            ]
          },
          {
            field: 'o_c_accredit',
            isRequired: false,
            childrens: [
              {
                field: 'o_c_accredit_advamount',
                isRequired: true,
                regex: amountRegex
              },
              {
                field: 'o_c_accredit',
                isRequired: false,
                childrens: [
                  {
                    field: 'o_c_accreditmrtnos',
                    isRequired: true,
                    childrens: [
                      {
                        field: 'o_c_accreditmrtno',
                        isRequired: false,
                        childrens: [
                          {
                            field: 'o_c_accredit_balance',
                            isRequired: true,
                            regex: amountRegex
                          },
                          {
                            field: 'o_c_accredit_starteddate',
                            isRequired: true,
                            regex: fullDateRegex
                          },
                          {
                            field: 'o_c_accredit_expdate',
                            isRequired: true,
                            regex: pureDateRegex
                          },
                          {
                            field: 'o_c_accredit_currencycode',
                            isRequired: true,
                            regex: stringRegex()
                          },
                          {
                            field: '_c_accredit_type',
                            isRequired: true,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_accredit_sectorcode',
                            isRequired: true,
                            regex: stringRegex()
                          },
                          {
                            field: 'o_c_accredit_fee',
                            isRequired: true,
                            regex: amountRegex
                          },
                          {
                            field: 'o_c_accredit_extcount',
                            isRequired: true,
                            regex: pureDateRegex
                          },
                          {
                            field: 'o_c_accredit_interestinperc',
                            isRequired: true,
                            regex: amountRegex
                          },
                          {
                            field: 'o_c_accredit_commissionperc',
                            isRequired: true,
                            regex: amountRegex
                          },
                          {
                            field: 'o_c_accredit_updatedexpdate ',
                            isRequired: true,
                            regex: pureDateRegex
                          },
                          {
                            field: 'o_c_accredit_isapproved',
                            isRequired: false,
                            regex: booleanRegex
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            field: 'o_c_loan_provideLoanSize',
            regex: amountRegex,
            isRequired: false
          }
          //o_c_loanrelnos:[o_c_loanrelno];
        ]
      }
    ]
  }
];

//#region interface

//#endregion
