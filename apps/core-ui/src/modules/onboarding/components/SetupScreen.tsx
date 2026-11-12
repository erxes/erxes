import type { Session } from '@erxes/core-contract';
import { IconCheck, IconSparkles } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, cn, Spinner } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '~/lib/api';
import { SESSION_KEY, useSession } from '~/modules/auth/session';
import { ONBOARDING_NS } from '../i18n';
import { Appear } from './Appear';

/** At least this long per step, so the steps read as progress, not a flash. */
const STEP_MS = 650;
/** Waiting longer than this for the example data offers to go on without it. */
const SKIP_AFTER_MS = 10_000;
/** And stops waiting altogether here (it still arrives; the lists refresh). */
const GIVE_UP_MS = 120_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * After the welcome steps: "Setting up your organization…" while the steps
 * are saved and, when asked for, the example data is seeded (by a job right
 * after, so this waits until the first example contacts exist). Then Home.
 */
export const SetupScreen = ({
  exampleData,
  onDone,
}: {
  exampleData: boolean;
  onDone: () => void;
}) => {
  const { t, i18n } = useTranslation(ONBOARDING_NS);
  const client = useQueryClient();
  const { organization } = useSession();
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canSkip, setCanSkip] = useState(false);
  const skipped = useRef(false);
  const session = useRef<Session | null>(null);
  const steps = [
    t('setup-workspace', 'Creating your workspace'),
    t('setup-settings', 'Setting up lead stages and settings'),
    ...(exampleData
      ? [t('setup-examples', 'Adding example contacts, notes and an automation')]
      : []),
    t('setup-final', 'Putting on the finishing touches'),
  ];

  const finish = () => {
    if (session.current) client.setQueryData(SESSION_KEY, session.current);
    // Lists read before the example data arrived are stale.
    void client.invalidateQueries();
    onDone();
  };

  const run = async () => {
    setError(null);

    try {
      session.current = await api.auth.onboarded({
        exampleData,
        language: i18n.language?.startsWith('mn') ? 'mn' : 'en',
      });
      setDone(1);
      await wait(STEP_MS);
      setDone(2);

      if (exampleData) {
        const started = Date.now();
        const skipTimer = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);

        // The job seeds them right after; the first contact means it's done (it's all-or-nothing).
        while (!skipped.current && Date.now() - started < GIVE_UP_MS) {
          const page = await api.customers.list({ limit: 1 }).catch(() => null);

          if (page && page.data.length > 0) break;
          await wait(1500);
        }

        clearTimeout(skipTimer);
        setDone(3);
        await wait(STEP_MS);
      }

      await wait(STEP_MS);
      setDone(steps.length);
      await wait(500);
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  useEffect(() => {
    void run();
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.round((done / steps.length) * 100);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-6">
      <div className="fixed inset-x-0 top-0 h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>
      <Appear y={16} duration={500} className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconSparkles className="size-8" stroke={1.75} />
          {done < steps.length && !error && (
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" />
          )}
        </div>
        <div className="space-y-1.5 text-center">
          <h1 className="text-xl font-semibold">
            {done >= steps.length
              ? t('setup-ready', 'All set!')
              : t('setup-title', { name: organization.name, defaultValue: 'Setting up {{name}}…' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('setup-description', 'This takes a few seconds.')}
          </p>
        </div>
        <ol className="w-full space-y-3">
          {steps.map((label, index) => {
            const state = index < done ? 'done' : index === done && !error ? 'active' : 'pending';

            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                    state === 'done' && 'border-primary bg-primary text-primary-foreground',
                    state === 'active' && 'border-primary/40',
                  )}
                >
                  {state === 'done' ? (
                    <IconCheck className="size-3.5" stroke={3} />
                  ) : state === 'active' ? (
                    <Spinner size="sm" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'transition-colors',
                    state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
        {error ? (
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => void run()}>
              {t('setup-retry', 'Try again')}
            </Button>
          </div>
        ) : (
          canSkip &&
          done < steps.length && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                skipped.current = true;
              }}
            >
              {t('setup-skip', 'Continue — the examples will appear in a moment')}
            </Button>
          )
        )}
      </Appear>
    </div>
  );
};
