const SATURDAY = 6
const SUNDAY = 0

// all objects and functions are exported by default
utilsModule = {
  closestWeekday: function closestWeekday(date, weekday=SATURDAY) {
    // returns the date of the closest future weekday for the given date
    const curr = new Date(date);
    while (curr.getDay() !== weekday) {
      curr.setDate(curr.getDate() + 1);
    }
    return curr
  },
  SATURDAY,
  SUNDAY
}