import { Icon } from './Icon';

export const SetupNotice = ({ missing }: { missing: string[] }) => (
  <div className="rounded-xl border border-line bg-white p-7">
    <div className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
        <Icon name="alert" size={22} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">
          Портал тохируулаагүй байна
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Мэдлэгийн сан болон CMS-ийн агуулгыг татахын тулд дараах орчны
          хувьсагчийг <code className="text-ink">.env.local</code> дотор
          тохируулна уу (загварыг <code className="text-ink">.env.example</code>
          -ээс үзнэ үү).
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
  title = 'Агуулгыг татаж чадсангүй',
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
          erxes gateway ажиллаж байгаа эсэх, app token болон topic ID зөв
          эсэхийг шалгана уу.
        </p>
      </div>
    </div>
  </div>
);
