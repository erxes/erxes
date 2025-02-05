"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: Readonly<TimePickerProps>) {
    const isValidTime = (time: string) => {
            if (!/^(\d{2}):(\d{2})$/.test(time)) {
              return false;
            }
            const [hours, minutes] = time.split(':').map(Number);
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
          };
  const parsedValue = isValidTime(value) ? value : "00:00";

  const hours = Number.parseInt(parsedValue.split(":")[0]);
  const minutes = Number.parseInt(parsedValue.split(":")[1]);
  const period = hours >= 12 ? "PM" : "AM";
  let hour12:number; 
  if (hours === 0) {
      hour12 = 12;
  } else if (hours > 12) {
      hour12 = hours - 12;
  } else {
      hour12 = hours;
  }
  

  const handleHourChange = (newHour: string) => {
    const hourNumber = Number.parseInt(newHour);
    if (!Number.isNaN(hourNumber)) {
      let hour24;
      if (period === "PM") {
        hour24 = hourNumber === 12 ? 12 : hourNumber + 12;
      } else {
        hour24 = hourNumber === 12 ? 0 : hourNumber;
      }
      onChange(`${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    const minuteNumber = Number.parseInt(newMinute);
    if (!Number.isNaN(minuteNumber)) {
      onChange(`${hours.toString().padStart(2, "0")}:${minuteNumber.toString().padStart(2, "0")}`);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (newPeriod === "AM" || newPeriod === "PM") {
      let hour24;
      if (newPeriod === "PM") {
        hour24 = hour12 === 12 ? 12 : hour12 + 12;
      } else {
        hour24 = hour12 === 12 ? 0 : hour12;
      }
      onChange(`${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Select value={hour12.toString().padStart(2, "0")} onValueChange={handleHourChange}>
          <SelectTrigger className="w-16 sm:w-20 h-10">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <SelectItem key={hour} value={String(hour).padStart(2, "0")}>
                  {String(hour).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <span className="text-muted-foreground">:</span>

      <div className="relative">
        <Select value={minutes.toString().padStart(2, "0")} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-16 sm:w-20 h-10">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectGroup>
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-16 sm:w-24 h-10">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}