export const MetaFieldLine = ({
  fieldName,
  content,
}: {
  fieldName: string;
  content: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between items-center text-foreground text-xs w-max">
      <span className="font-mono">{fieldName}:</span>
      <span className="font-mono">{content}</span>
    </div>
  );
};
