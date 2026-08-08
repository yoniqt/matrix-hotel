"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { getPhHolidays, getHolidayName } from "../../lib/ph-holidays";

function toDateOnlyString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  open,
  onOpenChange,
}) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const displayYear = selectedDate
    ? selectedDate.getFullYear()
    : new Date().getFullYear();

  const holidayDates = [
    ...getPhHolidays(displayYear),
    ...getPhHolidays(displayYear + 1),
  ].map((h) => new Date(`${h.date}T00:00:00`));

  function handleSelect(date) {
    if (!date) return;
    onChange(toDateOnlyString(date));
    onOpenChange(false);
  }

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-zinc-400">{label}</label>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-left font-medium ${
          value ? "text-zinc-100" : "text-zinc-500"
        }`}
      >
        {value || "Select date"}
      </button>

      {open && (
        <div className="ph-calendar absolute z-30 mt-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={minDate ? { before: new Date(`${minDate}T00:00:00`) } : undefined}
            modifiers={{ holiday: holidayDates }}
            modifiersClassNames={{ holiday: "ph-holiday" }}
            components={{
              DayButton: (props) => {
                const dateStr = toDateOnlyString(props.day.date);
                const holidayName = getHolidayName(
                  dateStr,
                  props.day.date.getFullYear()
                );
                return (
                  <button
                    {...props}
                    title={holidayName || undefined}
                  />
                );
              },
            }}
          />
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            PH holiday (hover a red date for its name)
          </p>
        </div>
      )}
    </div>
  );
}
