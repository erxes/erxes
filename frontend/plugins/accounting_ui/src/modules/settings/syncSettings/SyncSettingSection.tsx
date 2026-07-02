/** sync config section iin wrapper bn */
export const SyncSettingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <h3 className="text-sm font-medium text-foreground">{title}</h3>
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 xl:grid-cols-3">
      {children}
    </div>
  </section>
);
