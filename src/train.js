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
  if (prefix === "H") return {}; // 회송은 무시
  return segmentTimes;
}

// ─── 경로 기반 열차 진행률 계산 ───
function getProgressByRoute(train, segmentMap) {
  const route = train.경로;
  const current = train.현위치역;
  const next = train.다음역;
  const timeLeft = train.다음까지남은시간;

  let total = 0;
  let progressed = 0;
  let reachedCurrent = false;

  for (let i = 0; i < route.length - 1; i++) {
    const key = `${route[i]}→${route[i + 1]}`;
    const segmentTime = segmentMap[key] || 2;
    total += segmentTime;

    if (route[i] === current && route[i + 1] === next) {
      progressed += segmentTime - timeLeft;
      reachedCurrent = true;
    } else if (!reachedCurrent) {
      progressed += segmentTime;
    }
  }

  return Math.max(0, Math.min(100, (progressed / total) * 100));
}

// ─── 메인 실행 로직 ───
window.addEventListener("DOMContentLoaded", () => {
  const upload = document.getElementById("excelUpload");
  const status = document.getElementById("uploadStatus");

  upload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    status.textContent = "업로드 중…";
    status.style.color = "green";

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process", {
        method: "POST",
        body: form,
        mode: "cors"
      });

      const rawText = await res.text();
      window.trains = trains; // 🔥 콘솔에서 보기 위해 추가
      if (!res.ok) throw new Error(res.status);

      let trains = [];
      try {
        trains = JSON.parse(rawText);
      } catch (err) {
        console.error("❌ JSON 파싱 실패", err);
        status.textContent = "서버 응답 오류 (JSON 파싱 실패)";
        status.style.color = "red";
        return;
      }

      status.textContent = "업로드 및 분석 성공";
      status.style.color = "blue";

      document.querySelectorAll(".station .train-icon").forEach(icon => icon.remove());

      trains.forEach(train => {
        const segmentMap = getSegmentMap(train);
        if (Object.keys(segmentMap).length === 0) return; // 회송 제외

        const pct = getProgressByRoute(train, segmentMap);
        console.log(`📍 ${train.현위치역}→${train.다음역} (${train.열번}) 진행률: ${pct.toFixed(1)}%`);
        if (!train.다음역 || !train.경로.includes(train.다음역)) {
        console.warn(`🚨 ${train.현위치역} → 다음역 없음 또는 경로 불일치`);
        return; // 열차 아이콘 표시 안 함
}


        document.querySelectorAll(".station").forEach(stationEl => {
          const nameEl = stationEl.querySelector(".station-name");
          if (nameEl && nameEl.textContent.trim() === train.현위치역.trim()) {
            const icon = document.createElement("img");
            icon.src = "https://jangteam825.github.io/maintrans9/assets/train_icon.png";
            icon.alt = "열차";
            icon.className = "train-icon";
            icon.style.width = "20px";
            icon.style.position = "absolute";
            icon.style.top = "-24px";
            icon.style.left = "50%";
            icon.style.transform = "translateX(-50%)";
            (stationEl.querySelector(".station-dot") || stationEl).appendChild(icon);
          }
        });
      });

    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});
