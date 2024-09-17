// В приложении предусмотрено несколько фильтров:
// Everything — полный список точек маршрута;

// Future — список запланированных точек маршрута, т. е. точек, у которых дата начала события больше текущей даты;
const isPointFuture = (point) => {
  let currentDate = new Date();
  const pointDataFrom = new Date(point.dateFrom);

  return pointDataFrom > currentDate;
}

// Past — список пройденных точек маршрута, т. е. точек у которых дата окончания маршрута меньше, чем текущая.
const isPointPast = (point) => {
  let currentDate = new Date();
  const pointDataTo = new Date(point.dateTo);

  return pointDataTo < currentDate;
}

// Present — список текущих точек маршрута, т. е. точек, у которых дата начала события меньше (или равна) текущей даты, а дата окончания больше (или равна) текущей даты;
const isPointPresent = (point) => {
  let currentDate = new Date();
  const pointDataTo = new Date(point.dateTo);
  const pointDataFrom = new Date(point.dateFrom);

  return pointDataFrom <= currentDate && pointDataTo >= currentDate;
}






