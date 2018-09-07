import { COC_CONTENT_TYPES } from "../../constants";

const START_DATE = {
  year: 2017,
  month: 0
};

class BaseMonthActivityBuilder {
  public coc: any;
  public cocContentType: any;
  constructor(coc) {
    this.coc = coc;
  }

  /**
   * Get the number of days in the given month
   */
  public getIntervalEnd(year, month) {
    const date = new Date(year, month, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }

  /**
   * Generate dates with interval dates used to query ActivityLogs
   */
  public generateDates() {
    const now = new Date();

    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    const monthIntervals = [];

    let year = START_DATE.year;
    let month = START_DATE.month;

    do {
      monthIntervals.push({
        yearMonth: {
          year,
          month
        },
        interval: {
          start: new Date(year, month, 1),
          end: this.getIntervalEnd(year, month + 1)
        }
      });

      month++;

      if (month % 12 === 0) {
        month = 0;
        year++;
      }
    } while (year < endYear || (year === endYear && month <= endMonth));

    return monthIntervals;
  }

  /**
   * Build month intervals and collect ActivityLogForMonth resolver placeholders into them
   */
  public build() {
    const dates = this.generateDates();
    const list = [];

    for (const date of dates) {
      list.unshift({
        coc: this.coc,
        cocContentType: this.cocContentType,
        date
      });
    }

    return list;
  }
}

// Monthly log builder for customers
export class CustomerMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(coc) {
    super(coc);
    this.cocContentType = COC_CONTENT_TYPES.CUSTOMER;
  }
}

// Monthly log builder for companies
export class CompanyMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(coc) {
    super(coc);
    this.cocContentType = COC_CONTENT_TYPES.COMPANY;
  }
}

export class UserMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(coc) {
    super(coc);
    this.cocContentType = COC_CONTENT_TYPES.USER;
  }
}

export class DealMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(coc) {
    super(coc);
    this.cocContentType = COC_CONTENT_TYPES.DEAL;
  }
}

export default {
  CustomerMonthActivityLogBuilder,
  CompanyMonthActivityLogBuilder,
  UserMonthActivityLogBuilder,
  DealMonthActivityLogBuilder
};
