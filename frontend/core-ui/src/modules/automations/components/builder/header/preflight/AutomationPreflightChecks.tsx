import {
  IconAlertTriangle,
  IconCheck,
  IconPlayerPlayFilled,
  IconX,
} from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { TPreflightCheck } from './preflightReport';
import { TAutomationPreflight } from './useAutomationPreflight';

const EASE = [0.2, 0.8, 0.2, 1] as const;

type TRowState = TPreflightCheck['status'] | 'running' | 'waiting';

const RowMark = ({ state }: { state: TRowState }) => {
  if (state === 'waiting') {
    return <span className="size-2.5 rounded-full border border-border" />;
  }

  if (state === 'running') {
    return (
      <motion.span
        className="size-2.5 rounded-full bg-primary"
        animate={{ scale: [0.7, 1, 0.7], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }

  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
    >
      {state === 'ok' && <IconCheck className="size-4 text-success" />}
      {state === 'bad' && <IconX className="size-4 text-destructive" />}
      {state === 'warn' && (
        <IconAlertTriangle className="size-4 text-warning" />
      )}
    </motion.span>
  );
};

/** The checks a flow passes before it goes live, shown as they come in. */
export const AutomationPreflightChecks = ({
  preflight,
  title,
  onOpenNode,
}: {
  preflight: TAutomationPreflight;
  title: string;
  onOpenNode: (nodeId: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    checks,
    revealed,
    done,
    loading,
    failed,
    elapsedMs,
    issueCount,
    tone,
  } = preflight;
  const progress = done ? 1 : checks.length ? revealed / checks.length : 0;

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <IconPlayerPlayFilled className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">
            {t('preflight-subtitle')} ·{' '}
            <span className="font-mono">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={tone}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs',
              tone === 'progress' && 'bg-primary/10 text-primary',
              tone === 'bad' && 'bg-destructive/10 text-destructive',
              tone === 'ok' && 'bg-success/10 text-success',
              tone === 'unavailable' && 'bg-warning/10 text-warning',
            )}
          >
            {tone === 'progress' && t('preflight-checking')}
            {tone === 'bad' && t('preflight-to-fix', { count: issueCount })}
            {tone === 'ok' && t('preflight-ready')}
            {tone === 'unavailable' && t('preflight-unavailable')}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="h-0.5 bg-border">
        <motion.div
          className={cn(
            'h-full',
            tone === 'bad'
              ? 'bg-destructive'
              : tone === 'ok'
              ? 'bg-success'
              : 'bg-primary',
          )}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      </div>
      {failed && (
        <div className="px-3 py-3 text-xs text-warning">
          {t('preflight-failed')}
        </div>
      )}
      <motion.ul layout className="py-1">
        {loading && !checks.length && (
          <li className="flex items-center gap-2.5 px-3 py-2 text-sm">
            <RowMark state="running" />
            <motion.span
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {t('preflight-checking')}
            </motion.span>
          </li>
        )}
        {checks.map((check, index) => {
          const shown = done || index < revealed;
          const state: TRowState = shown
            ? check.status
            : index === revealed
            ? 'running'
            : 'waiting';

          return (
            <motion.li
              key={check.key}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { duration: 0.55, ease: EASE },
                delay: done ? 0 : index * 0.04,
              }}
            >
              <div
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm',
                  state === 'waiting' && 'text-muted-foreground',
                )}
              >
                <span className="flex size-4 items-center justify-center">
                  <RowMark state={state} />
                </span>
                <span className="flex-1">
                  {t(`preflight-check-${check.key}`)}
                </span>
                {shown && check.ms !== undefined && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-[11px] text-muted-foreground"
                  >
                    {check.ms} ms
                  </motion.span>
                )}
              </div>
              <AnimatePresence initial={false}>
                {shown && check.items.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {check.items.map((item, itemIndex) => (
                      <motion.div
                        key={`${item.nodeId}-${itemIndex}`}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + itemIndex * 0.09 }}
                        className="flex items-start gap-2 py-1.5 pl-10 pr-3 text-xs text-muted-foreground"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">
                            {preflight.labelOf(item.nodeId)}
                          </div>
                          <div className="line-clamp-2" title={item.message}>
                            {item.message}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 rounded-full px-2 text-xs"
                          onClick={() => onOpenNode(item.nodeId)}
                        >
                          {t('preflight-open')}
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
};
