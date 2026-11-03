export const MailConfigHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="mt-4 mb-8">
    <h2 className="font-semibold text-lg">{title}</h2>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);
