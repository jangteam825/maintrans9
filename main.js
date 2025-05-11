
// main.js
// 브라우저 환경에서만 실행되는 코드
if (typeof window !== "undefined") {
  window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed!");
  });
}

const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Heroku는 환경변수로 포트를 제공합니다

// 정적 파일 제공
app.use(express.static('public'));

// 루트 경로 요청에 대한 응답
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // index.html 파일 제공
});

// 서버 실행
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

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

  const arrival = new Date(departure.getTime() + totalMinutes * 5000);
  return arrival.getHours().toString().padStart(2, '0') + ":" + arrival.getMinutes().toString().padStart(2, '0');
}

function getProgressPercentage(trainType, from, to, departureTime) {
  const schedule = trainType === 'express' ? expressTimes : normalTimes;
  let totalMinutes = 0;
  let elapsedMinutes = 0;
  let started = false;
  const now = new Date();
  const [hours, minutes] = departureTime.split(":" ).map(Number);
  const departure = new Date();
  departure.setHours(hours);
  departure.setMinutes(minutes);

  for (let i = 0; i < schedule.length; i++) {
    const segment = schedule[i];
    if (segment.from === from) started = true;
    if (started) {
      totalMinutes += segment.time;
      const segmentStart = new Date(departure.getTime() + elapsedMinutes * 60000);
      const segmentEnd = new Date(segmentStart.getTime() + segment.time * 60000);
      if (now >= segmentStart && now < segmentEnd) {
        const withinSegment = (now - segmentStart) / (segmentEnd - segmentStart);
        elapsedMinutes += withinSegment * segment.time;
        break;
      } else if (now > segmentEnd) {
        elapsedMinutes += segment.time;
      }
      if (segment.to === to) break;
    }
  }
  return Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100));
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
    const progress = getProgressPercentage(train.type, train.from, train.to, train.departureTime);
    const trainElement = document.createElement('div');
    trainElement.className = 'train';

    trainElement.style.position = 'absolute';
    trainElement.style.top = train.type === 'express' ? '-80px' : '60px';
    trainElement.style.left = `${progress}%`;
    trainElement.style.transform = 'translateX(-50%)';
    trainElement.style.transition = 'left 1s linear';

    const arrivalToDangsan = getArrivalTime(train.type, train.from, '당산역', train.departureTime);
    const arrivalToBohun = getArrivalTime(train.type, train.from, '중앙보훈병원', train.departureTime);
    const arrivalToDangsanDown = arrivalToDangsan;

    const [depH, depM] = train.departureTime.split(":" ).map(Number);
    const depDate = new Date();
    depDate.setHours(depH);
    depDate.setMinutes(depM);

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

    document.querySelector('.lines-wrapper').appendChild(trainElement);
  });
}

// 브라우저 환경에서 실행
if (typeof window !== "undefined") {
  window.addEventListener('DOMContentLoaded', () => {
    renderTrains();
    setInterval(() => {
      document.querySelectorAll('.train').forEach(e => e.remove());
      renderTrains();
    }, 60000); // 1분마다 위치 갱신
  });
}
// 🚆 열차 시각화용 샘플 데이터 불러오기
fetch("train_visual_sample.json")
  .then((res) => res.json())
  .then((trains) => {
    console.log("🔥 열차 시각화 시작", trains);

    trains.forEach((train) => {
      const elem = document.createElement("div");
      elem.className = "moving-train";
      elem.innerText = train.열번;

      // 현재 위치역에 열차 붙이기
      document.querySelectorAll(".station-name").forEach((el) => {
        if (el.textContent.includes(train.현위치역)) {
          const dot = el.previousElementSibling;
          if (dot) dot.appendChild(elem);
        }
      });

      // 3초마다 다음역으로 이동
      let pos = 1;
      const interval = setInterval(() => {
        if (pos >= train.경로.length) return;
        const nextStation = train.경로[pos];

        document.querySelectorAll(".station-name").forEach((el) => {
          if (el.textContent.includes(nextStation)) {
            const dot = el.previousElementSibling;
            if (dot && elem) {
              dot.appendChild(elem);
            }
          }
        });

        pos++;
      }, 3000);
    });
  });
