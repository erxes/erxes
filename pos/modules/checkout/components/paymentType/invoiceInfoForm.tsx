import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userNameAtom, userBankAddressAtom, accountTypeAtom, companyRegisterAtom, invoiceExpiryDaysAtom } from "@/store";

interface UserInfoFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, onCancel }) => {
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userBankAddress, setUserBankAddress] = useAtom(userBankAddressAtom);
  const [accountType, setAccountType] = useAtom(accountTypeAtom);
  const [companyRegister, setCompanyRegister] = useAtom(companyRegisterAtom);
  const [expiryDays, setExpiryDays] = useAtom(invoiceExpiryDaysAtom);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid = () => {
    const baseValid = userName.trim() && userBankAddress.trim() && expiryDays >= 1 && expiryDays <= 365;
    if (accountType === "company") {
      return baseValid && companyRegister.trim();
    }
    return baseValid;
  };

  const isExpiryDaysValid = expiryDays >= 1 && expiryDays <= 365;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-black">User Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accountType" className="text-black">Account Type</Label>
            <Select value={accountType} onValueChange={(value) => setAccountType(value as "person" | "company")}>
              <SelectTrigger className="mt-1 text-black">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="userName" className="text-black">
              {accountType === "company" ? "Company Name" : "Full Name"}
            </Label>
            <Input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={accountType === "company" ? "Enter company name" : "Enter your full name"}
              className="mt-1 text-black"
              required
            />
          </div>

          {accountType === "company" && (
            <div>
              <Label htmlFor="companyRegister" className="text-black">Company Register Number</Label>
              <Input
                id="companyRegister"
                type="text"
                value={companyRegister}
                onChange={(e) => setCompanyRegister(e.target.value)}
                placeholder="Enter company register number"
                className="mt-1 text-black"
                required
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="bankAddress" className="text-black">Bank Address</Label>
            <Input
              id="bankAddress"
              type="text"
              value={userBankAddress}
              onChange={(e) => setUserBankAddress(e.target.value)}
              placeholder="Enter your bank address"
              className="mt-1 text-black"
              required
            />
          </div>

          <div>
            <Label htmlFor="expiryDays" className="text-black">Payment Deadline (Days)</Label>
            <Input
              id="expiryDays"
              type="number"
              min="1"
              max="365"
              value={expiryDays}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setExpiryDays(value);
                }
              }}
              placeholder="Enter payment deadline in days"
              className="mt-1 text-black"
              required
            />
            {!isExpiryDaysValid && expiryDays > 0 && (
              <p className="text-red-500 text-xs mt-1">Please enter a value between 1 and 365 days</p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit"
              className="flex-1"
              disabled={!isFormValid()}
            >
              Нэхэмжлэл үүсгэх
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 text-black"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;