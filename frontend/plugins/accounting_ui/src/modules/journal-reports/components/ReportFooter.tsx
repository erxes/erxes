import { useAtomValue } from "jotai";
import { currentUserState } from "ui-modules";

export const ReportFooter = () => {
  const currentUser = useAtomValue(currentUserState);

  return (
    <div className="py-8 flex flex-col gap-4 pl-[30%]">
      <div>
        Тайлан гаргасан: ................................../{currentUser?.details?.fullName || currentUser?.email || ''}/
      </div>
      <div>
        Хянасан нягтлан бодогч: ................................../____________________________/
      </div>
    </div>
  );
}