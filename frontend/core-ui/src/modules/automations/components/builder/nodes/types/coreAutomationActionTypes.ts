import { LazyAutomationComponent, NodeData } from '@/automations/types';
import { TAutomationAction } from 'ui-modules';

export type TAutomationActionConfigFieldPrefix = `actions.${number}.config`;

export enum TAutomationActionComponent {
  Sidebar = 'sidebar',
  NodeContent = 'nodeContent',
  ActionResult = 'actionResult',
  WaitEventForm = 'waitEvent',
}

export type TSidebarComponentProps = {
  currentActionIndex: number;
  currentAction: TAutomationAction;
  handleSave: <TConfig = any>(config: TConfig) => void;
};

export type NodeContentComponentProps<TConfig = any> = {
  nodeData: NodeData<TConfig>;
  config: TConfig;
};
export type ActionResultComponentProps = {};
export type WaitEventFormComponentProps<TConfig = any> = {
  actionData: TAutomationAction;
  config: TConfig;
};

export type TActionComponents = {
  sidebar?: LazyAutomationComponent<TSidebarComponentProps>;
  nodeContent?: LazyAutomationComponent<NodeContentComponentProps>;
  actionResult?: LazyAutomationComponent<ActionResultComponentProps>;
  waitEvent?: LazyAutomationComponent<WaitEventFormComponentProps>;
};

interface CoreComponentPropsMap {
  [TAutomationActionComponent.Sidebar]: TSidebarComponentProps;
  [TAutomationActionComponent.NodeContent]: NodeContentComponentProps;
  [TAutomationActionComponent.ActionResult]: ActionResultComponentProps;
  [TAutomationActionComponent.WaitEventForm]: WaitEventFormComponentProps;
}

// Simplified type using mapped type
export type CoreComponentReturn<T extends TAutomationActionComponent> =
  LazyAutomationComponent<CoreComponentPropsMap[T]>;
