import { NavigationMenuGroup, NavigationMenuLinkItem } from "erxes-ui/modules";
import { GET_CAR_MODULES } from "~/modules/constants"

export const NavigationCarModules = () => {
    const CAR_MODULES = GET_CAR_MODULES();

    return (
        <NavigationMenuGroup name = "Car modules">
            {CAR_MODULES.filter((item) => !item.settingsOnly).map((item) => (
                <NavigationMenuLinkItem
                    key = {item.name}
                    name = {item.name}
                    icon = {item.icon}
                    path = {item.path}
                />
            ))}
        </NavigationMenuGroup>
    )
}