export interface IBoard {
	_id: string;
}

export interface IPipeline {
	_id: string,
	name: string
}

export interface IStage {
	_id: string,
	name?: string
	type?: string,
	index?: number,
	itemId?: string
}

export interface IDeal {
	_id: string,
	name: string
}