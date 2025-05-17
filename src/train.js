// ─── 역간 소요시간표 (일반열차) ───
const segmentTimes = {
  "개화→김포공항": 5,
  "김포공항→공항시장": 2,
  "공항시장→신방화역": 1,
  "신방화역→마곡나루역": 1,
  "마곡나루역→양천향교역": 2,
  "양천향교역→가양역": 2,
  "가양역→증미역": 2,
  "증미역→등촌역": 2,
  "등촌역→염창역": 2,
  "염창역→신목동역": 1,
  "신목동역→선유도역": 1,
  "선유도역→당산역": 2,
  "당산역→국회의사당역": 2,
  "국회의사당역→여의도역": 2,
  "여의도역→샛강역": 1,
  "샛강역→노량진역": 1,
  "노량진역→노들역": 1,
  "노들역→흑석역": 1,
  "흑석역→동작역": 2,
  "동작역→구반포": 1,
  "구반포→신반포": 1,
  "신반포→고속터미널역": 1,
  "고속터미널역→사평역": 2,
  "사평역→신논현": 1,
  "신논현→언주역": 1,
  "언주역→선정릉역": 1,
  "선정릉역→삼성중앙역": 1,
  "삼성중앙역→봉은사역": 1,
  "봉은사역→종합운동장역": 2,
  "종합운동장역→삼전역": 3,
  "삼전역→석촌고분역": 2,
  "석촌고분역→석촌역": 2,
  "석촌역→송파나루역": 2,
  "송파나루역→한성백제역": 2,
  "한성백제역→올림픽공원역": 2,
  "올림픽공원역→둔촌오륜역": 2,
  "둔촌오륜역→중앙보훈병원": 2
};

// ─── 역간 소요시간표 (급행열차) ───
const segmentTimesExpress = {
  "김포공항→마곡나루": 3,
  "마곡나루→가양역": 5,
  "가양역→염창역": 4,
  "염창역→당산역": 4,
  "당산역→여의도역": 4,
  "여의도역→노량진역": 3,
  "노량진역→동작역": 6,
  "동작역→고속터미널역": 3,
  "고속터미널역→신논현역": 2,
  "신논현역→선정릉역": 2,
  "선정릉역→봉은사역": 4,
  "봉은사역→종합운동장역": 2,
  "종합운동장역→석촌역": 3,
  "석촌역→올림픽공원역": 6,
  "올림픽공원역→중앙보훈병원": 4
};

// ─── 열차 종류에 따른 소요시간 테이블 선택 ───
function getSegmentMap(train) {
  const prefix = train.열번?.[0];
  if (prefix === "E") return segmentTimesExpress;
  if (prefix === "H") return {};
  return segmentTimes;
}

// ─── 경로 기반 열차 진행률 계산 ───
function getProgressByRoute(train, segmentMap) {
  const { 경로: route, 현위치역: current, 다음역: next, 다음까지남은시간: timeLeft } = train;
  let total = 0, progressed = 0, reachedCurrent = false;

  for (let i = 0; i < route.length - 1; i++) {
    const key = `${route[i]}→${route[i+1]}`;
    const segTime = segmentMap[key] || 2;
    total += segTime;
    if (!reachedCurrent) {
      if (route[i] === current && route[i+1] === next) {
        progressed += segTime - timeLeft;
        reachedCurrent = true;
      } else {
        progressed += segTime;
      }
    }
  }
  return Math.round((Math.max(0, Math.min(100, (progressed / total) * 100))) * 10) / 10;
}

// ─── 메인 실행 로직 ───
window.addEventListener("DOMContentLoaded", () => {
  const upload = document.getElementById("excelUpload");
  const status = document.getElementById("uploadStatus");
  const API_URL = "https://maintrans9-fix-3dfc4c86991d.herokuapp.com/api/process";

  upload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    console.log('[DEBUG] 파일 선택됨:', file?.name);
    if (!file) return;

    status.textContent = "업로드 중…";
    status.style.color = "green";

    const form = new FormData();
    form.append("file", file);
    console.log('[DEBUG] Fetch 호출:', API_URL);

    try {
      const res = await fetch(API_URL, { method: "POST", body: form, mode: "cors" });
      console.log('[DEBUG] Fetch 응답 상태:', res.status);
      const text = await res.text();
      let trains = [];
      try {
        trains = JSON.parse(text);
        console.log('[DEBUG] 파싱된 열차 데이터:', trains);
      } catch (err) {
        console.error('[ERROR] JSON 파싱 실패', err);
        status.textContent = '서버 응답 오류 (JSON 파싱 실패)';
        status.style.color = 'red';
        return;
      }

      status.textContent = "업로드 및 분석 성공";
      status.style.color = "blue";

      document.querySelectorAll('.station .train-icon').forEach(icon => icon.remove());

  trains.forEach(train => {
  // '역' 접미사 제거
  const strip = s => s?.replace(/역$/, "") || "";
  train.경로 = train.경로.map(strip);
  train.현위치역 = strip(train.현위치역);
  train.다음역 = strip(train.다음역);

  const segmentMap = getSegmentMap(train);
  if (!Object.keys(segmentMap).length) return;

  document.querySelectorAll('.station').forEach(stationEl => {
    const nameEl = stationEl.querySelector('.station-name');
    if (nameEl?.textContent.trim() === train.현위치역) {
      // x좌표 계산
      const stationDot = stationEl.querySelector('.station-dot');
      const stationRect = stationDot.getBoundingClientRect();
      const containerRect = stationEl.parentNode.getBoundingClientRect();
      const left = stationRect.left - containerRect.left + (stationRect.width/2) - 10;

      // .line-container 기준으로 append
      const lineContainer = stationEl.parentNode; // .line-container
      const icon = document.createElement('img');
      icon.src = 'https://jangteam825.github.io/maintrans9/assets/train_icon.png';
      icon.alt = '열차';
      icon.className = 'train-icon';
      icon.style.position = 'absolute';
      icon.style.left = `${left}px`;

      // 급행/일반 라인에 맞게 y값 조정
      const prefix = train.열번?.[0];
      if (prefix === 'E') { // 급행(빨간라인)
        icon.style.top = '-48px';
      } else { // 일반(노란라인)
        icon.style.top = '38px';
      }

      lineContainer.appendChild(icon);

      // 라벨 (번호)도 같이 띄우고 싶으면 아래처럼
      const label = document.createElement('div');
      label.textContent = `${train.열번} (${train.편성}편성)`;
      label.style.position = 'absolute';
      label.style.left = `${left}px`;
      label.style.fontSize = '10px';
      label.style.color = 'black';
      label.style.top = prefix === 'E' ? '-35px' : '60px'; // 라벨도 라인 따라 조정

      lineContainer.appendChild(label);
    }
  });
});

    } catch (err) {
      console.error('[ERROR] 업로드 실패:', err);
      status.textContent = '업로드 실패: ' + err.message;
      status.style.color = 'red';
    }
  });
});
