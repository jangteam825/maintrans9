
// main.js

// 열차 데이터 배열: 실제로는 나중에 엑셀 데이터를 여기에 넣거나 서버에서 가져와서 업데이트할 예정
const trainData = [
  { trainNumber: '9101', carNumber: '23', station: '개화' },
  { trainNumber: '9102', carNumber: '24', station: '당산' }
];

// 열차 정보를 노선도에 렌더링하는 함수
function renderTrains() {
  // 모든 역(station) 요소를 가져옴
  const stationElements = document.querySelectorAll('.station');

  // 각 열차 데이터마다 역 요소들을 확인하여 열차 위치에 맞게 렌더링
  trainData.forEach(train => {
    stationElements.forEach(station => {
      const nameElement = station.querySelector('.station-name');

      // 데이터의 역 이름과 실제 HTML의 역 이름이 일치하면 열차 아이콘을 추가
      if (nameElement.textContent === train.station) {
        const trainElement = document.createElement('div');
        trainElement.className = 'train';

        trainElement.innerHTML = `
          <img src="assets/train_icon.png" alt="train icon" class="train-icon">
          <div class="train-info">
            <span class="train-number">열번: ${train.trainNumber}</span>
            <span class="car-number">편성: ${train.carNumber}</span>
          </div>`;

        // 생성된 열차 아이콘과 정보를 역 요소에 추가
        station.appendChild(trainElement);
      }
    });
  });
}

// 페이지 로딩 후 바로 열차 정보 렌더링
window.addEventListener('DOMContentLoaded', renderTrains);
