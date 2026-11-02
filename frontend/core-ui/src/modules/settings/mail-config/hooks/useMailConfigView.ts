import { useMultiQueryState } from 'erxes-ui';

const VIEWS = ['sending', 'senders', 'template'] as const;

export type TMailConfigView = (typeof VIEWS)[number];

const isMailConfigView = (
  value: string | null | undefined,
): value is TMailConfigView =>
  (VIEWS as readonly string[]).includes(value ?? '');

export const useMailConfigView = () => {
  const [queryParams] = useMultiQueryState<{ view: string }>(['view']);

  const view: TMailConfigView = isMailConfigView(queryParams.view)
    ? queryParams.view
    : 'sending';

  return { view };
};
