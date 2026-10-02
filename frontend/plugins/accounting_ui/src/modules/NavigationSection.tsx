import { IconChevronRight } from '@tabler/icons-react';
import { cn, Collapsible, Sidebar } from 'erxes-ui';
import { ElementType, useState } from 'react';
import { Link, useLocation } from 'react-router';

const matchesPath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

type TNavigationSectionItem = {
  name: string;
  icon: ElementType;
  path: string;
};

export const NavigationSection = ({
  name,
  icon: Icon,
  sectionPath,
  items,
}: {
  name: string;
  icon: ElementType;
  sectionPath: string;
  items: TNavigationSectionItem[];
}) => {
  const { pathname } = useLocation();
  const inSection = matchesPath(pathname, sectionPath);
  const [open, setOpen] = useState(inSection);
  const [wasInSection, setWasInSection] = useState(inSection);

  if (inSection !== wasInSection) {
    setWasInSection(inSection);

    if (inSection) {
      setOpen(true);
    }
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/navigation-section"
    >
      <Sidebar.MenuItem>
        <Collapsible.Trigger asChild>
          <Sidebar.MenuButton>
            <Icon
              className={cn(
                'text-accent-foreground',
                inSection && 'text-primary',
              )}
            />
            <span className="min-w-0 flex-1 truncate">{name}</span>
            <IconChevronRight className="size-3.5! text-muted-foreground transition-transform duration-200 group-data-[state=open]/navigation-section:rotate-90" />
          </Sidebar.MenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content
          forceMount
          className="grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
        >
          <div className="min-h-0 overflow-hidden">
            <Sidebar.Sub className="border-l">
              {items.map((item) => {
                const isActive = matchesPath(pathname, `/${item.path}`);

                return (
                  <Sidebar.SubItem key={item.path}>
                    <Sidebar.SubButton
                      asChild
                      className="font-medium"
                      isActive={isActive}
                    >
                      <Link to={`/${item.path}`}>
                        <item.icon
                          className={cn(
                            'text-accent-foreground',
                            isActive && 'text-primary',
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </Sidebar.SubButton>
                  </Sidebar.SubItem>
                );
              })}
            </Sidebar.Sub>
          </div>
        </Collapsible.Content>
      </Sidebar.MenuItem>
    </Collapsible>
  );
};
