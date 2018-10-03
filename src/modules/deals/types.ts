import { IUser } from "../auth/types";
import { ICompany } from "../companies/types";
import { ICustomer } from "../customers/types";

// TODO: check
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
	amount: any;
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

export interface IProductData {
	_id: string,
	productId?: string,
	uom?: string,
	currency?: string,
	quantity: number,
	unitPrice: number,
	taxPercent: number,
	tax: number,
	discountPercent: number,
	discount: number,
	amount: number,
}

// rename to Position
type position = {
	_id?: string,
	droppableId?: string,
	index: number
}

export interface IDragResult {
	type: string,
	destination: position,
	source: position,
	draggableId?: string,
	itemId?: string
}

export interface IDealParams {
	_id?: string,
  name: string,
  stageId: string,
  assignedUserIds?: string[],
  companyIds?: string[],
  customerIds?: string[],
  closeDate?: Date,
  description?: string,
  order?: number,
  productsData?: IProductData[]
}