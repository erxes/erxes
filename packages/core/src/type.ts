export type Result = { [key: string]: string | number | undefined };
export type BoardItemsFilter = {
    _id?: { $in: string[] };
};
type CreatedInfo = {
    _id: string;
    type: string;
    validation: string;
    text: string;
    value: string | Date;
};
export type MessageData = {
    datas: any;
    createdInfo: CreatedInfo;
}