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

const UserInfo = () => {
  const userName = useAtomValue(userNameAtom)
  const userBankAddress = useAtomValue(userBankAddressAtom)
  const company = useAtomValue(companyRegisterAtom)
  const accountType = useAtomValue(accountTypeAtom)
  const total = useAtomValue(totalAmountAtom)
  const cartItems = useAtomValue(cartAtom)

  const transactionDate = useMemo(() => new Date(), [])
  const deadlineDate = useMemo(() => addDays(transactionDate, 14), [transactionDate])
  const isCompany = accountType === "company"
  
  return (
    <div style={{ 
      padding: '8px', 
      backgroundColor: 'white',
      color: '#111827',
    }}>
      <h2 className="text-lg font-semibold text-gray-800">Нэхэмжлэл гаргах мэдээлэл</h2>
      
      <div className="space-y-2 text-sm">
        <p>
          <strong>{isCompany ? "Байгууллагын нэр:" : "Овог, нэр:"}</strong> {userName}
        </p>
        {isCompany && company && (
          <p>
            <strong>Бүртгэлийн дугаар:</strong> {company}
          </p>
        )}
        <p>
          <strong>Банкны дансны дугаар:</strong> MN{userBankAddress}
        </p>
        <p className="text-lg font-bold">
          <strong>Нийт төлбөр:</strong> {formatNum(total)}₮
        </p>
      </div>
      
      <div className="border-t pt-4">
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#374151',
          marginBottom: '16px'
        }}>Захиалгын мэдээлэл</h3>
        
        {cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: '#6b7280'
          }}>
            Захиалга хоосон байна
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            border: '1px solid #374151',
            marginTop: '16px',
            marginBottom: '16px'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '12px 8px',
                    textAlign: 'center',
                    width: '60px',
                    fontWeight: 'bold'
                  }}>#</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '12px 8px',
                    textAlign: 'left',
                    fontWeight: 'bold'
                  }}>Бүтээгдэхүүн</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '12px 8px',
                    textAlign: 'center',
                    width: '120px',
                    fontWeight: 'bold'
                  }}>Тоо ширхэг</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '12px 8px',
                    textAlign: 'right',
                    width: '140px',
                    fontWeight: 'bold'
                  }}>Нэгжийн үнэ</th>
                  <th style={{ 
                    border: '1px solid #374151', 
                    padding: '12px 8px',
                    textAlign: 'right',
                    width: '140px',
                    fontWeight: 'bold'
                  }}>Нийт үнэ</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={item._id}>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {index + 1}
                    </td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '10px 8px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {item.productName}
                        </div>
                        {item.isTake && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#059669',
                            fontWeight: '500'
                          }}>
                            ✓ Авч явах
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {item.count}
                    </td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '10px 8px',
                      textAlign: 'right'
                    }}>
                      {formatNum(item.unitPrice)}₮
                    </td>
                    <td style={{ 
                      border: '1px solid #374151', 
                      padding: '10px 8px',
                      textAlign: 'right',
                      fontWeight: '500'
                    }}>
                      {formatNum(item.count * item.unitPrice)}₮
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '8px',
        color: '#374151',
        lineHeight: '1.6',
        fontSize: '14px',
      }}>
        <p>
          Бид <strong>{userName}</strong> {isCompany ? "байгууллагыг" : "нэр дээрх хүнийг"}{" "}
          <strong>MN{userBankAddress}</strong> дугаартай банкны данс руу{" "}
          <strong>{formatNum(total)}₮</strong> төгрөгийн төлбөрийг нэхэмжилж байна.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f9fafb',
        padding: '8px',
        fontSize: '14px',
        color: '#374151',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              Гүйлгээний огноо
            </h3>
            <p style={{ fontWeight: '500', marginBottom: '4px' }}>
              {transactionDate.toLocaleDateString()}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              {transactionDate.toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              Төлбөр төлөх хугацаа
            </h3>
            <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '4px' }}>
              {deadlineDate.toLocaleDateString()}
            </p>
            <p style={{ fontSize: '12px', color: '#ef4444' }}>
              (14 хоногийн дотор төлнө үү)
            </p>
          </div>
        </div>
      </div>

      <div style={{ 
        borderTop: '1px solid #e5e7eb',
        fontSize: '14px',
        color: '#374151'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Гарын үсэг:</p>
        <div style={{ 
          width: '192px', 
          height: '24px', 
          borderBottom: '1px solid #9ca3af',
        }}></div>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>Нэхэмжлэл гаргасан</p>
        <p>_________________________</p>
      </div>
    </div>
  )
}

export default UserInfo