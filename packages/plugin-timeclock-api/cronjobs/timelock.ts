import { Sequelize, DataTypes, Op } from 'sequelize';
import { generateModels, models } from '../src/connectionResolver';

/**
 * Connects to mysql server and extracts
 */

export interface ITimeClock {
  userId?: string;
  employeeId?: string;
  shiftStart: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;
  branchName?: number;
  latitude?: number;
}

export const connectToMysql = async (req, res) => {
  const sequelize = new Sequelize('testt', 'nandi', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    define: { freezeTableName: true }
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(error => {
      console.error('Unable to connect to the database: ', error);
    });

  const Timeclock = sequelize.define(
    '`dbo.attLog`',
    {
      ID: {
        type: DataTypes.STRING
      },
      authDateTime: {
        type: DataTypes.DATE
      },
      authDate: {
        type: DataTypes.DATEONLY
      },
      authTime: {
        type: DataTypes.TIME
      },
      direction: {
        type: DataTypes.STRING
      },
      deviceName: {
        type: DataTypes.STRING
      },
      deviceSerialNo: {
        type: DataTypes.STRING
      },
      employeeName: {
        type: DataTypes.STRING
      },
      cardNo: {
        type: DataTypes.STRING
      }
    },
    { timestamps: false }
  );

  const data = extractAllData(Timeclock);
  // console.log('111111', data);

  // for (const timeRow of data) {

  // }

  // extractNewData(Timeclock);
  res.json('success');
};

const extractAllData = (db: any) => {
  let data;
  const timeclockData: ITimeClock[] = [];

  db.findAll({
    raw: true,
    order: [
      ['ID', 'ASC'],
      ['authDateTime', 'ASC']
    ],
    limit: 10
  })
    .then(response => {
      data = JSON.parse(JSON.stringify(response));
      for (const row of data) {
        // console.log('heheh', row);
        //   const empId = row._ID;
        //   const branch = row.deviceName;
        //   const empName = row.employeeName;
        //   const getEarliestTime = row.authDateTime;
        //   const getLatestTime = row.authDateTime;
        //   console.log('hjehhehehhe', empId, branch, empName);
        //   const time = models?.Timeclocks.createTimeClock({
        //     shiftStart: getEarliestTime,
        //     shiftEnd: getLatestTime,
        //     shiftActive: false
        //   });
      }
    })
    .catch(error => {
      console.error('Failed to retrieve data : ', error);
    });

  return data;
};

const extractNewData = (db: any) => {
  // find all time clock of today
  const time = new Date('2022-12-22');

  const arr = db
    .findAll({
      raw: true,
      authDateTime: {
        where: { [Op.gte]: time }
      }
    })
    .then(res => {
      // console.log('22222222222222', res);
    });
};
