"use client"

import QrOrder from "@/modules/qr/QrOrder"

const QrOrderPage = ({ params }: { params: { slotCode: string } }) => {
  const slotCode = decodeURIComponent(params.slotCode || "")
  return <QrOrder slotCode={slotCode} />
}

export default QrOrderPage
