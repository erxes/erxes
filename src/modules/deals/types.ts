import { IUser } from "../auth/types";
import { ICompany } from "../companies/types";
import { ICustomer } from "../customers/types";

export interface IBoard {
	_id: string;
}

export interface IPipeline {
	_id: string;
	name: string;
}

export interface IStage {
	_id: string;
	name: string;
	type: string;
	index: number;
	itemId: string;
}

export interface IDeal {
	_id: string;
	name: string;
	stageId: string;
	assignedUsers: IUser[];
	companies: ICompany[];
	customers: ICustomer[];
	pipeline: IPipeline;
	closeDate: Date;
	amount: number;
	modifiedAt: Date;
	products: any;
}