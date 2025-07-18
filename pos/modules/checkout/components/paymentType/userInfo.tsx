import React, { useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  userNameAtom,
  userBankAddressAtom,
  companyRegisterAtom,
  accountTypeAtom,
} from "@/store";
import { formatNum } from "@/lib/utils";
import { totalAmountAtom } from "@/store/cart.store";

const UserInfo = () => {
  const userName = useAtomValue(userNameAtom);
  const userBankAddress = useAtomValue(userBankAddressAtom);
  const company = useAtomValue(companyRegisterAtom);
  const accountType = useAtomValue(accountTypeAtom);
  const total = useAtomValue(totalAmountAtom);

  const transactionDate = useMemo(() => new Date(), []);

  return (
    <div className="border p-6 rounded-xl shadow-md bg-white space-y-3 text-gray-900">
      <h2 className="text-lg font-semibold">Нэхэмжлэл гаргах мэдээлэл</h2>

      <div className="space-y-1">
        <p>
          <strong>{accountType === "company" ? "Байгууллагын нэр:" : "Овог, нэр:"}</strong>{" "}
          {userName}
        </p>

        {accountType === "company" && company && (
          <p>
            <strong>Бүртгэлийн дугаар:</strong> {company}
          </p>
        )}

        <p>
          <strong>Банкны дансны дугаар:</strong> MN{userBankAddress}
        </p>

        <p>
          <strong>Нийт төлбөр:</strong> {formatNum(total)}₮
        </p>
      </div>

      <div className="mt-4 p-4 bg-gray-50 border rounded text-gray-800 leading-relaxed">
        <p>
          Бид{" "}
          <strong>{userName}</strong>{" "}
          {accountType === "company" ? "байгууллагыг" : "нэр дээрх хүнийг"}{" "}
          <strong>MN{userBankAddress}</strong> дугаартай банкны данс руу{" "}
          <strong>{formatNum(total)}₮</strong> төгрөгийн төлбөрийг нэхэмжилж байна.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Transaction Date</h3>
        <p>{transactionDate.toLocaleDateString()}</p>
        <p className="text-sm text-gray-600">{transactionDate.toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default UserInfo;