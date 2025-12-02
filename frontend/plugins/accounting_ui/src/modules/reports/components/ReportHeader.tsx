import { Separator } from "erxes-ui"

export const ReportHeader = () => {
  return (
    <>
      <h1 className="text-[2em] leading-tight font-bold text-center py-[1em]">
        Гүйлгээ баланс
      </h1>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          <p className="font-bold">Нью Панда ХХК</p>
          <Separator className="print:bg-foreground bg-border" />
          <p>(Аж ахуй нэгж албан байгууллагын нэр)</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>2025/11/01 - 2025/11/30</p>
          <p>(төгрөгөөр)</p>
        </div>
      </div>
    </>
  )
}