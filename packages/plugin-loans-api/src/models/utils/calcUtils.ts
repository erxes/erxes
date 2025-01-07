import { BigNumber } from 'bignumber.js';
import * as moment from 'moment';
import { IModels } from '../../connectionResolver';
import { getConfig } from '../../messageBroker';
import { IPerHoliday, addMonths, calcPerMonthEqual, calcPerMonthFixed, getEqualPay, getFullDate } from './utils';
import { IContractDocument } from '../definitions/contracts';


// guilgee garsan ch gesen gereend uurchlult oruulah uzegdel, first main ali aliniig zasna gesen ug, gehde ireeduinh
export const correctionSchedules = async (models: IModels, contractId: string) => {

}

// hamgiin suuliin guilgeenees hoishi undsen schedules dahin tootsoh
export const generatePendingSchedules = async (models: IModels) => {

}
