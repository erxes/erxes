import type React from "react";
import { Button, Label } from "erxes-ui";
import { IconUpload } from "@tabler/icons-react";

interface FileUploadSectionProps {
  label: string;
  buttonText: string;
  variant?: "default" | "secondary";
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  label,
  buttonText,
  variant = "default"
}) => {
  const buttonClasses = variant === "secondary" 
    ? "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
    : "";

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 tracking-wider mb-1">
        {label}
      </Label>
      <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
        <Button variant="outline" className={buttonClasses} type="button">
          <IconUpload className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
};