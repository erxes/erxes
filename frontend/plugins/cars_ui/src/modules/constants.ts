import { IconAddressBook } from "@tabler/icons-react";
import { IUIConfig } from "erxes-ui/types";

export const GET_CAR_MODULES = (): IUIConfig['modules'] => {
    const MODULES: IUIConfig['modules'] = [
        {
            name: 'cars',
            icon: IconAddressBook,
            path: 'cars',
            hasSettings: false,
        },
        {
            name: 'categories',
            icon: IconAddressBook,
            path: 'categories',
            hasSettings: false,
        }
    ]
    return MODULES
}