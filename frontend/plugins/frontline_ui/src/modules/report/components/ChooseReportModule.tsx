import { Button, TextOverflowTooltip, useQueryState } from 'erxes-ui';

export const ChooseReportModule = () => {
  return (
    <div>
      <ReportModuleItem />
    </div>
  );
};

export const ReportModuleItem = () => {
  return (
    <Button
      variant={'ghost'}
      className="justify-start pl-7 relative overflow-hidden text-left flex-auto"
    >
      <TextOverflowTooltip value="Report Module" />
    </Button>
  );
};
