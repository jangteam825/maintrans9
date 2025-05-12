
export function parseDepartureTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date().setHours(hours, minutes, 0, 0);
}

export function calculateArrivalTime(train, segmentTimes) {
  const departureTime = parseDepartureTime(train.departureTime);
  if (!departureTime) return null;

  let totalMinutes = 0;
  for (let segment of segmentTimes) {
    if (segment.trainNo === train.trainNo) {
      totalMinutes += parseInt(segment.duration);
    }
  }

  return new Date(departureTime + totalMinutes * 60000);
}

export function visualizeTrains(trains, segmentTimes) {
  const now = new Date();

  trains.forEach((train) => {
    const arrivalTime = calculateArrivalTime(train, segmentTimes);
    if (!arrivalTime || arrivalTime < now) return;

    const countdown = Math.floor((arrivalTime - now) / 60000);

    const el = document.createElement("div");
    el.className = "train-info";
    el.innerText = `열번: ${train.trainNo}, 도착까지 ${countdown}분`;
    document.querySelector("#lines-wrapper").appendChild(el);
  });
}
