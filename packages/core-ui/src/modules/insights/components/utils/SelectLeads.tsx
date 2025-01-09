import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';

const integrations = `
    query integrations($kind: String, $brandId: String, $searchValue: String) {
        integrations(kind: $kind, brandId: $brandId, searchValue: $searchValue) {
        _id
        name
        form {
            _id
            title
        }
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
    function generateUserOptions(integrations: IIntegration[] = []): IOption[] {

        const options = integrations.map(integration => {
            const form = (integration as any).form || ({} as any);

            return {
                value: form._id,
                label: integration.name,
            };
        });

        return options
    }

    return (
        <SelectWithSearch
            label={label}
            queryName="integrations"
            name={name}
            filterParams={filterParams}
            initialValue={defaultValue}
            generateOptions={generateUserOptions}
            onSelect={onSelect}
            customQuery={integrations}
            customOption={customOption}
            multi={multi}
            showAvatar={false}
        />
    );
};