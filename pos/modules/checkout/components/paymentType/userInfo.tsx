"use client"

import { useMemo } from "react"
import { useAtomValue } from "jotai"
import { addDays } from "date-fns"

import { 
  userNameAtom, 
  userBankAddressAtom, 
  companyRegisterAtom, 
  accountTypeAtom 
} from "@/store"
import { formatNum } from "@/lib/utils"
import { totalAmountAtom, cartAtom } from "@/store/cart.store"
import { usePrintStyles } from "../../hooks/usePrintStyles"

const UserInfo = () => {
  const userName = useAtomValue(userNameAtom)
  const userBankAddress = useAtomValue(userBankAddressAtom)
  const company = useAtomValue(companyRegisterAtom)
  const accountType = useAtomValue(accountTypeAtom)
  const total = useAtomValue(totalAmountAtom)
  const cartItems = useAtomValue(cartAtom)

  const { userInfo, table, columnWidths } = usePrintStyles()

  const transactionDate = useMemo(() => new Date(), [])
  const deadlineDate = useMemo(() => addDays(transactionDate, 14), [transactionDate])
  const isCompany = accountType === "company"
  
  return (
    <div style={userInfo.container}>
      <h2 style={userInfo.heading}>Нэхэмжлэл гаргах мэдээлэл</h2>
      
      <div style={userInfo.userInfoSection}>
        <div style={userInfo.userInfoItem}>
          <strong>{isCompany ? "Байгууллагын нэр:" : "Овог, нэр:"}</strong> {userName}
        </div>
        {isCompany && company && (
          <div style={userInfo.userInfoItem}>
            <strong>Бүртгэлийн дугаар:</strong> {company}
          </div>
        )}
        <div style={userInfo.userInfoItem}>
          <strong>Банкны дансны дугаар:</strong> MN{userBankAddress}
        </div>
        <div style={userInfo.totalAmount}>
          <strong>Нийт төлбөр:</strong> {formatNum(total)}₮
        </div>
      </div>
      
      <div style={userInfo.sectionDivider}>
        <h3 style={userInfo.heading}>Захиалгын мэдээлэл</h3>
        
        {cartItems.length === 0 ? (
          <div style={userInfo.emptyCart}>
            Захиалга хоосон байна
          </div>
        ) : (
          <div style={table.container}>
            <table style={table.table}>
              <thead>
                <tr style={table.header}>
                  <th style={{
                    ...table.headerCellCenter,
                    width: columnWidths.index
                  }}>
                    #
                  </th>
                  <th style={table.headerCell}>
                    Бүтээгдэхүүн
                  </th>
                  <th style={{
                    ...table.headerCellCenter,
                    width: columnWidths.quantity
                  }}>
                    Тоо ширхэг
                  </th>
                  <th style={{
                    ...table.headerCellRight,
                    width: columnWidths.unitPrice
                  }}>
                    Нэгжийн үнэ
                  </th>
                  <th style={{
                    ...table.headerCellRight,
                    width: columnWidths.withoutVat
                  }}>
                    НӨАТ-гүй үнэ
                  </th>
                  <th style={{
                    ...table.headerCellRight,
                    width: columnWidths.totalPrice
                  }}>
                    Нийт үнэ
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  const totalItemPrice = item.count * item.unitPrice;
                  const withoutVatPrice = totalItemPrice / 1.1;
                  
                  return (
                    <tr key={item._id}>
                      <td style={table.cellCenter}>
                        {index + 1}
                      </td>
                      <td style={table.cell}>
                        <div>
                          <div style={table.productName}>
                            {item.productName}
                          </div>
                          {item.isTake && (
                            <div style={table.takeAwayLabel}>
                              ✓ Авч явах
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={table.cellCenter}>
                        {item.count}
                      </td>
                      <td style={table.cellRight}>
                        {formatNum(item.unitPrice)}₮
                      </td>
                      <td style={table.cellRight}>
                        {formatNum(Math.round(withoutVatPrice))}₮
                      </td>
                      <td style={table.cellRightBold}>
                        {formatNum(totalItemPrice)}₮
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={userInfo.infoSection}>
        <p>
          <strong>{userName}</strong> {isCompany ? "байгууллагыг" : "нэр дээрх хүнийг"}{" "}
          <strong>MN{userBankAddress}</strong> дугаартай банкны данс руу{" "}
          <strong>{formatNum(total)}₮</strong> төгрөгийн төлбөрийг нэхэмжилж байна.
        </p>
      </div>

      <div style={userInfo.dateSection}>
        <div style={userInfo.dateGrid}>
          <div>
            <h3 style={userInfo.dateLabel}>
              Гүйлгээний огноо
            </h3>
            <p style={userInfo.dateValue}>
              {transactionDate.toLocaleDateString()}
            </p>
            <p style={userInfo.dateTime}>
              {transactionDate.toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h3 style={userInfo.dateLabel}>
              Төлбөр төлөх хугацаа
            </h3>
            <p style={userInfo.deadlineDate}>
              {deadlineDate.toLocaleDateString()}
            </p>
            <p style={userInfo.deadlineNote}>
              (14 хоногийн дотор төлнө үү)
            </p>
          </div>
        </div>
      </div>

      <div style={userInfo.signatureSection}>
        <p style={userInfo.signatureLabel}>Гарын үсэг:</p>
        <div style={userInfo.signatureLine}></div>
        <p style={userInfo.signatureNote}>Нэхэмжлэл гаргасан</p>
        <p>_________________________</p>
      </div>
    </div>
  )
}

export default UserInfo