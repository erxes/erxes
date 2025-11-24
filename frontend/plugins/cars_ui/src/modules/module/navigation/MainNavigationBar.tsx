import { Sidebar } from "erxes-ui/components";
import { NavigationCarModules } from "./NavigationCarModules";

const SHOW_COMPONENTS = false;

export const MainNavigationBar = () => {
    return (
        <>
            <Sidebar.Header className = "px-2 h-[3.25rem] justify-center">
                <Sidebar.Menu>
                    <Sidebar.MenuItem className="flex gap-2 items-center">
                    </Sidebar.MenuItem>
                </Sidebar.Menu>
            </Sidebar.Header>
            <Sidebar.Separator className="mx-0" />
            <Sidebar.Content className="gap-0">
                <NavigationCarModules />
            </Sidebar.Content>
        </>
    );
};

export default MainNavigationBar;