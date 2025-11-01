import { TablerIcon } from '@tabler/icons-react';
export type TabType = 'ticket' | 'chat' | 'faq' | 'call' | 'bug' | 'default';

export type HeaderContentType = 'hero-intro' | 'header-tabs';

export interface IHeaderItem {
  title: string;
  Icon: TablerIcon;
  value: TabType;
  disabled: boolean;
}
