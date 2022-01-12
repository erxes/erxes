import { IUser } from '@erxes/ui/src/auth/types';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
export declare function generateUserOptions(array?: IUser[]): IOption[];

declare const _default: (props: {
    queryParams?: IQueryParams | undefined;
    filterParams?: {
        status: string;
    } | undefined;
    label: string;
    onSelect: (value: string | string[], name: string) => void;
    multi?: boolean | undefined;
    customOption?: IOption | undefined;
    initialValue?: string | string[] | undefined;
    name: string;
}) => JSX.Element;
export default _default;
