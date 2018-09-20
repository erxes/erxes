import { IUser } from "modules/auth/types";

export interface IImportHistory {
    _id: string,
    success: string,
    failed: string,
    total: string,
    contentType: string,
    date: Date,
    user: IUser
}