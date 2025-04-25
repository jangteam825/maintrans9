
// main.js

const normalTimes = [
  // ... (생략: 기존 normalTimes 정의)
];

const expressTimes = [
  // ... (생략: 기존 expressTimes 정의)
];

function getArrivalTime(trainType, from, to, departureTime) {
  const schedule = trainType === 'express' ? expressTimes : normalTimes;

  let totalMinutes = 0;
  let started = false;

  for (let i = 0; i < schedule.length; i++) {
    const segment = schedule[i];
    if (segment.from === from) {
      started = true;
    }
    if (started) {
      totalMinutes += segment.time;
      if (segment.to === to) break;
    }
  }

  const [hours, minutes] = departureTime.split(":").map(Number);
  const departure = new Date();
  departure.setHours(hours);
  departure.setMinutes(minutes);

  const arrival = new Date(departure.getTime() + totalMinutes * 60000);
  return arrival.getHours().toString().padStart(2, '0') + ":" + arrival.getMinutes().toString().padStart(2, '0');
}

function renderTrains() {
  const trainData = [
    {
      trainNumber: '9101',
      carNumber: '23',
      station: '개화',
      type: 'normal',
      from: '개화',
      to: '중앙보훈병원',
      departureTime: '06:00'
    },
    {
      trainNumber: '9102',
      carNumber: '24',
      station: '당산역',
      type: 'express',
      from: '김포공항',
      to: '중앙보훈병원역',
      departureTime: '06:46'
    }
  ];

  const now = new Date();

  trainData.forEach(train => {
    const stationElements = document.querySelectorAll('.station');
    stationElements.forEach(station => {
      const nameElement = station.querySelector('.station-name');
      if (nameElement.textContent === train.station) {
        const trainElement = document.createElement('div');
        trainElement.className = 'train';

        trainElement.style.position = 'absolute';
        trainElement.style.top = train.type === 'express' ? '-80px' : '60px';
        trainElement.style.left = '50%';
        trainElement.style.transform = 'translateX(-50%)';

        const arrivalToDangsan = getArrivalTime(train.type, train.from, '당산역', train.departureTime);
        const arrivalToBohun = getArrivalTime(train.type, train.from, '중앙보훈병원', train.departureTime);
        const arrivalToDangsanDown = getArrivalTime(train.type, train.from, '당산역', train.departureTime); // 단순화

        const [depH, depM] = train.departureTime.split(":").map(Number);
        const depDate = new Date();
        depDate.setHours(depH, depM);

        const arrDangsanDate = new Date(depDate.getTime() + 60000 * (parseInt(arrivalToDangsan.split(":"))[0] * 60 + parseInt(arrivalToDangsan.split(":"))[1]));
        const showDown = now > arrDangsanDate;

        const primaryArrivalLabel = showDown ? '보훈병원 하선' : '당산 상선';
        const primaryArrivalTime = showDown ? arrivalToBohun : arrivalToDangsan;
        const secondaryArrivalLabel = showDown ? '당산 하선' : '보훈병원 상선';
        const secondaryArrivalTime = showDown ? arrivalToDangsanDown : arrivalToBohun;

        trainElement.innerHTML = train.type === 'express' ? `
          <div class="train-info">
            <span class="train-number">열번: ${train.trainNumber}</span><br>
            <span class="car-number">편성: ${train.carNumber}</span><br>
            <span class="arrival-time">${primaryArrivalLabel}: ${primaryArrivalTime}</span><br>
            <span class="arrival-time">${secondaryArrivalLabel}: ${secondaryArrivalTime}</span>
          </div>
          <img src="assets/train_icon.png" alt="train icon" class="train-icon">
        ` : `
          <img src="assets/train_icon.png" alt="train icon" class="train-icon">
          <div class="train-info">
            <span class="train-number">열번: ${train.trainNumber}</span><br>
            <span class="car-number">편성: ${train.carNumber}</span><br>
            <span class="arrival-time">${primaryArrivalLabel}: ${primaryArrivalTime}</span><br>
            <span class="arrival-time">${secondaryArrivalLabel}: ${secondaryArrivalTime}</span>
          </div>
        `;

        station.appendChild(trainElement);
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', renderTrains);
