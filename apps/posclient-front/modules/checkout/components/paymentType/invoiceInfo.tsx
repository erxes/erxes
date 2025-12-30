"use client"

import { useMemo } from "react"
import { useAtomValue } from "jotai"
import { addDays } from "date-fns"

import { 
  userNameAtom, 
  userBankAddressAtom, 
  companyRegisterAtom, 
  accountTypeAtom,
  invoiceExpiryDaysAtom
} from "@/store"
import { formatNum } from "@/lib/utils"
import { totalAmountAtom, cartAtom } from "@/store/cart.store"
import { useInvoicePrintStyles } from "../../hooks/useInvoicePrintStyles"

const VAT_RATE = 0.1; 
const VAT_MULTIPLIER = 1 + VAT_RATE;

const InvoiceInfo = () => {
  const userName = useAtomValue(userNameAtom)
  const userBankAddress = useAtomValue(userBankAddressAtom)
  const company = useAtomValue(companyRegisterAtom)
  const accountType = useAtomValue(accountTypeAtom)
  const expiryDays = useAtomValue(invoiceExpiryDaysAtom)
  const total = useAtomValue(totalAmountAtom)
  const cartItems = useAtomValue(cartAtom)

  const { userInfo, table } = useInvoicePrintStyles()

  const transactionDate = useMemo(() => new Date(), [])
  const deadlineDate = useMemo(() => addDays(transactionDate, expiryDays), [transactionDate, expiryDays])
  const isCompany = accountType === "company"
  
  const totals = useMemo(() => {
    const totalWithoutVat = cartItems.reduce((sum, item) => {
      const totalItemPrice = item.count * item.unitPrice
      return sum + (totalItemPrice / VAT_MULTIPLIER)
    }, 0)
    const vatAmount = total - totalWithoutVat
    
    return {
      subtotal: Math.round(totalWithoutVat),
      vat: Math.round(vatAmount),
      total: Math.round(total)
    }
  }, [cartItems, total])
  
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
              ({expiryDays} хоногийн дотор төлнө үү)
            </p>
          </div>
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
            <table style={{...table.table, fontSize: '12px'}}>
              <thead>
                <tr style={table.header}>
                  <th style={{
                    ...table.headerCellCenter,
                    width: '50px',
                    padding: '8px 6px'
                  }}>
                    #
                  </th>
                  <th style={{...table.headerCell, padding: '8px 6px'}}>
                    Бүтээгдэхүүн
                  </th>
                  <th style={{
                    ...table.headerCellCenter,
                    width: '80px',
                    padding: '8px 6px'
                  }}>
                    Тоо ширхэг
                  </th>
                  <th style={{
                    ...table.headerCellRight,
                    width: '100px',
                    padding: '8px 6px'
                  }}>
                    Нэгжийн үнэ
                  </th>
                  <th style={{
                    ...table.headerCellRight,
                    width: '100px',
                    padding: '8px 6px'
                  }}>
                    Нийт үнэ
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  const totalItemPrice = item.count * item.unitPrice;
                  
                  return (
                    <tr key={item._id}>
                      <td style={{...table.cellCenter, padding: '6px'}}>
                        {index + 1}
                      </td>
                      <td style={{...table.cell, padding: '6px'}}>
                        <div>
                          <div style={table.productName}>
                            {item.productName}
                          </div>
                          {item.isTake && (
                            <div style={{...table.takeAwayLabel, fontSize: '10px'}}>
                              ✓ Авч явах
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{...table.cellCenter, padding: '6px'}}>
                        {item.count}
                      </td>
                      <td style={{...table.cellRight, padding: '6px'}}>
                        {formatNum(item.unitPrice)}₮
                      </td>
                      <td style={{...table.cellRightBold, padding: '6px'}}>
                        {formatNum(totalItemPrice)}₮
                      </td>
                    </tr>
                  )
                })}
                <tr style={{borderTop: '2px solid #374151'}}>
                  <td style={{...table.cell, padding: '6px', border: 'none'}} colSpan={3}></td>
                  <td style={{...table.cellRight, padding: '6px', fontWeight: 'bold'}}>
                    НӨАТ-гүй дүн:
                  </td>
                  <td style={{...table.cellRightBold, padding: '6px'}}>
                    {formatNum(totals.subtotal)}₮
                  </td>
                </tr>
                
                <tr>
                  <td style={{...table.cell, padding: '6px', border: 'none'}} colSpan={3}></td>
                  <td style={{...table.cellRight, padding: '6px', fontWeight: 'bold'}}>
                    НӨАТ (10%):
                  </td>
                  <td style={{...table.cellRightBold, padding: '6px'}}>
                    {formatNum(totals.vat)}₮
                  </td>
                </tr>
                
                <tr style={{backgroundColor: '#f3f4f6'}}>
                  <td style={{...table.cell, padding: '8px', border: 'none'}} colSpan={3}></td>
                  <td style={{
                    ...table.cellRight, 
                    padding: '8px', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    Нийт төлбөр:
                  </td>
                  <td style={{
                    ...table.cellRightBold, 
                    padding: '8px',
                    fontSize: '14px',
                    color: '#059669'
                  }}>
                    {formatNum(totals.total)}₮
                  </td>
                </tr>
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

      <div style={userInfo.signatureSection}>
        <p style={userInfo.signatureLabel}>Гарын үсэг:</p>
        <div style={userInfo.signatureLine}></div>
        <p style={userInfo.signatureNote}>Нэхэмжлэл гаргасан</p>
        <p>_________________________</p>
      </div>
    </div>
  )
}

export default InvoiceInfo