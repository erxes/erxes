import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';

const clientPortalGetConfigs = `
    query clientPortalGetConfigs($kind: BusinessPortalKind) {
        clientPortalGetConfigs(kind: $kind) {
            _id
            name
        }
    }
`;

export default (props: {
    queryParams?: IQueryParams;
    filterParams?: any;
    label: string;
    onSelect: (value: string[] | string, name: string) => void;
    multi?: boolean;
    customOption?: IOption;
    customField?: string;
    initialValue?: string | string[];
    name: string;
}) => {
    const {
        queryParams,
        onSelect,
        customOption,
        initialValue,
        multi = true,
        label,
        filterParams,
        name
    } = props;
    const defaultValue = queryParams ? queryParams[name] : initialValue;

    // get user options for react-select
    function generateUserOptions(array: any[] = []): IOption[] {

        const options = array.map(item => {
            return {
                value: item._id,
                label: item.name,
            };
        });

        return options
    }

    return (
        <SelectWithSearch
            label={label}
            queryName="clientPortalGetConfigs"
            name={name}
            filterParams={filterParams}
            initialValue={defaultValue}
            generateOptions={generateUserOptions}
            onSelect={onSelect}
            customQuery={clientPortalGetConfigs}
            customOption={customOption}
            multi={multi}
            showAvatar={false}
        />
    );
};