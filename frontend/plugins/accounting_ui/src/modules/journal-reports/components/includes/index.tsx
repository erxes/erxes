import { HandleMainAC } from "./main/ac";
import { HandleMainACMore } from "./main/acMore";
import { HandleMainTB } from "./main/tb";

export const getCalcReportHandler = (report: string) => {
  const handlers: any = {
    ac: HandleMainAC,
    tb: HandleMainTB,
  };

  return handlers[report];
}

export const getRenderMoreHandler = (report: string, isMore: boolean) => {
  if (!isMore) {
    return;
  }
  const handlers: any = {
    ac: HandleMainACMore,
    tb: () => (null),
  };

  return handlers[report];
}
