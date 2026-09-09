import { Icon } from './Icon';

export const SetupNotice = ({ missing }: { missing: string[] }) => (
  <div className="rounded-xl border border-line bg-white p-7">
    <div className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
        <Icon name="alert" size={22} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">
          The portal is not configured
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          To load knowledge base and CMS content, set the following environment
          variables in <code className="text-ink">.env.local</code> (see{' '}
          <code className="text-ink">.env.example</code> for a template).
        </p>
        <ul className="mt-4 space-y-1.5">
          {missing.map((key) => (
            <li
              key={key}
              className="flex items-center gap-2 rounded-md bg-subtle px-3 py-2 font-mono text-[13px] text-ink"
            >
              <Icon name="lock" size={14} className="text-muted-foreground" />
              {key}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export const LoadError = ({
  message,
  title = 'Could not load the content',
}: {
  message: string;
  title?: string;
}) => (
  <div className="rounded-xl border border-danger/25 bg-danger-soft/50 p-7">
    <div className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-danger">
        <Icon name="alert" size={22} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1.5 break-words text-sm leading-relaxed text-ink-soft">
          {message}
        </p>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Check that the erxes gateway is running and that the app token and
          topic ID are correct.
        </p>
      </div>
    </div>
  </div>
);

export const Unpublished = ({ domain }: { domain: string }) => (
  <div className="rounded-xl border border-line bg-white p-7">
    <div className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
        <Icon name="alert" size={22} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">
          No help center is published here
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Nothing in erxes claims this address yet. Open Frontline → Help
          Center, create or edit a help center, and set its website to:
        </p>
        <p className="mt-4 break-all rounded-md bg-subtle px-3 py-2 font-mono text-[13px] text-ink">
          {domain}
        </p>
      </div>
    </div>
  </div>
);
