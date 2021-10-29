const SATURDAY = 6

// all objects and functions are exported by default
utilsModule = {
  closestSaturday: function closestSaturday(date) {
    // returns the date of the closest future Saturday for the given date
    const curr = new Date(date);
    while (curr.getDay() !== SATURDAY) {
      curr.setDate(curr.getDate() + 1);
    }
    return curr
  }
}