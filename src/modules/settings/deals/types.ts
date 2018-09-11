export interface IBoard {
    _id: string;
    name: string;
}

export interface IPipeline {
    _id: string;
    name: string;
    boardId: string;
}

export interface IStage {
    _id: string;
    name: string;
    probability: string;
    pipelineId: string;
}