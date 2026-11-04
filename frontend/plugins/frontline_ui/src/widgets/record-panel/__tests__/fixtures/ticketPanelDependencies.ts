import { createElement, type PropsWithChildren } from 'react';

const mockAvailableModule = (
  moduleName: string,
  factory: () => unknown,
): void => {
  let resolvedModuleName: string;
  try {
    resolvedModuleName = require.resolve(moduleName);
  } catch {
    return;
  }
  jest.doMock(resolvedModuleName, factory);
};

jest.mock('@/ticket/components/add-ticket/AddTicketForm', () => ({
  AddTicketForm: () => null,
}));
jest.mock('@/activity/components/ActivityList', () => ({
  ActivityList: () => null,
}));
jest.mock('@/ticket/components/ticket-detail/TicketDetailActions', () => ({
  TicketDetailActions: () => null,
}));
jest.mock('@/ticket/components/ticket-detail/TicketPipelineProperties', () => ({
  TicketPipelineProperties: () => null,
}));
mockAvailableModule('~/widgets/record-panel/TicketPanelDetail', () => ({
  TicketPanelDetail: () => null,
}));
mockAvailableModule('@/knowledgebase/shared/components/KbFormLayout', () => ({
  KbFormItem: ({ children }: PropsWithChildren) =>
    createElement('div', null, children),
}));
jest.mock('@/ticket/hooks/useGetTicket', () => ({
  useGetTicket: () => ({ ticket: null, loading: false }),
}));
jest.mock('@/ticket/hooks/useTicketCustomFieldEdit', () => ({
  useTicketCustomFieldEdit: jest.fn(),
}));
