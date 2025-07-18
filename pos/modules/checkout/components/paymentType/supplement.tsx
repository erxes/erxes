import React, { forwardRef } from "react";
import UserInfo from "./userInfo";

const PrintableSupplement = forwardRef<HTMLDivElement>(
  (props, ref) => {
    return (
      <div ref={ref} className="text-black p-6 max-w-2xl mx-auto">
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Нэхэмжлэх Мэдээлэл</h1>
          <p className="text-center text-gray-600">Transaction Details</p>
        </div>
        
        <div className="mb-6">
          <div className=" gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <UserInfo/>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>This document serves as a payment supplement for your records.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    );
  }
);

PrintableSupplement.displayName = "PrintableSupplement";

export default PrintableSupplement;