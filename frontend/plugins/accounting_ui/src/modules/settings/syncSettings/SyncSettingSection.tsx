export const SyncSettingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-1 pt-3 first:pt-0">
    <h3 className="pb-1 text-xs font-medium text-muted-foreground">{title}</h3>
    {children}
  </section>
);
