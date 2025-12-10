import { HandleMainAC } from "./main/ac";
import { HandleMainTB } from "./main/tb";

export const getCalcReportHandler = (report: string) => {
  const handlers: any = {
    ac: HandleMainAC,
    tb: HandleMainTB,
  };

  return handlers[report];
}
