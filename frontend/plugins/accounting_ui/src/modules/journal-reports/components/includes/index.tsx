import { HandleMainTB } from "./main/tb";

export const getCalcReportHandler = (report: string) => {
  const handlers: any = {
    // ac: handleMainAC,
    tb: HandleMainTB,
  };

  return handlers[report];
}
