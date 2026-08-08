// Fixed regular holidays: same calendar date every year, safe for any year.
function fixedHolidaysForYear(year) {
  return [
    { date: `${year}-01-01`, name: "New Year's Day" },
    { date: `${year}-04-09`, name: "Araw ng Kagitingan" },
    { date: `${year}-05-01`, name: "Labor Day" },
    { date: `${year}-06-12`, name: "Independence Day" },
    { date: `${year}-11-30`, name: "Bonifacio Day" },
    { date: `${year}-12-25`, name: "Christmas Day" },
    { date: `${year}-12-30`, name: "Rizal Day" },
  ];
}

// Movable holidays: officially proclaimed shortly before each year, so only
// confirmed years are listed here. Source: Proclamation 1006 s.2026.
const MOVABLE_HOLIDAYS_BY_YEAR = {
  2026: [
    { date: "2026-02-17", name: "Chinese New Year (special non-working)" },
    { date: "2026-04-02", name: "Maundy Thursday" },
    { date: "2026-04-03", name: "Good Friday" },
    { date: "2026-04-04", name: "Black Saturday" },
    { date: "2026-08-21", name: "Ninoy Aquino Day" },
    { date: "2026-08-31", name: "National Heroes Day" },
    { date: "2026-12-08", name: "Feast of the Immaculate Conception" },
  ],
};

export function getPhHolidays(year) {
  const fixed = fixedHolidaysForYear(year);
  const movable = MOVABLE_HOLIDAYS_BY_YEAR[year] || [];
  return [...fixed, ...movable];
}

export function getHolidayName(dateStr, year) {
  const holiday = getPhHolidays(year).find((h) => h.date === dateStr);
  return holiday ? holiday.name : null;
}
