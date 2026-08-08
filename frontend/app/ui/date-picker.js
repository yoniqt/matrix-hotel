"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { getPhHolidays, getHolidayName } from "../../lib/ph-holidays";

function toDateOnlyString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePicker({ label, value, onChange, minDate }) {
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-zinc-500">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-left"
      >
        {value || "Select date"}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
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
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            PH holiday (hover a red date for its name)
          </p>
        </div>
      )}
    </div>
  );
}
