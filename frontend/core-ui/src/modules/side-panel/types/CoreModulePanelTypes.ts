import type { FocusSheet, Sheet } from 'erxes-ui';
import type {
  ComponentProps,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactElement,
  ReactNode,
  RefAttributes,
} from 'react';
export type TModulePanelProps = ComponentProps<typeof Sheet> & {
  name: string;
  maxWidth?: number;
  defaultWidth?: number;
  requiredPermission?: string;
};

export type TModulePanelViewProps = ComponentProps<typeof Sheet.View> & {
  loading?: boolean;
  error?: boolean;
  notFound?: boolean;
  errorState?: ReactNode;
  notFoundState?: ReactNode;
};

export type ModulePanelContextValue = {
  path: string;
  name: string;
  open: boolean;
  allowed: boolean;
  permissionsLoaded: boolean;
  onClose: () => void;
  onOpen: () => void;
} | null;

type ModulePanelComponents = {
  Trigger: typeof Sheet.Trigger;
  View: ForwardRefExoticComponent<
    PropsWithoutRef<TModulePanelViewProps> & RefAttributes<HTMLDivElement>
  >;
  Header: (props: ComponentProps<typeof Sheet.Header>) => ReactElement;
  Content: (props: ComponentProps<typeof Sheet.Content>) => ReactElement;
  Footer: (props: ComponentProps<typeof Sheet.Footer>) => ReactElement;
  Title: typeof Sheet.Title;
  Description: typeof Sheet.Description;
  Close: typeof Sheet.Close;
};

export type TCoreModulePanel = ((
  props: TModulePanelProps & { focus?: boolean },
) => ReactElement) &
  ModulePanelComponents;

export type TCoreFocusPanel = ((props: TModulePanelProps) => ReactElement) &
  Omit<typeof FocusSheet, 'Header' | 'View' | 'Content' | 'SideBar'> &
  Pick<ModulePanelComponents, 'Trigger' | 'View'> & {
    Header: (props: ComponentProps<typeof FocusSheet.Header>) => ReactElement;
    Content: (props: ComponentProps<typeof FocusSheet.Content>) => ReactElement;
    SideBar: (props: ComponentProps<typeof FocusSheet.SideBar>) => ReactElement;
  };
