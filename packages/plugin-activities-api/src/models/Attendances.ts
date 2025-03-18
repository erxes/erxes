import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import {
  attendancesSchema,
  IAttendancesDocument,
} from "./definitions/attendances";

export interface IAttendancesModel extends Model<IAttendancesDocument> {
  getAttendance(_id: string): Promise<IAttendancesDocument>;
}

export const loadAttendancesClass = (models: IModels) => {
  class Attendances {
    /**
     * Retreives attendance
     */
    public static async getAttendance(_id: string) {
      const attendance = await models.Attendances.findOne({ _id });

      if (!attendance) {
        throw new Error("Attendance not found");
      }

      return attendance;
    }
  }

  attendancesSchema.loadClass(Attendances);

  return attendancesSchema;
};
