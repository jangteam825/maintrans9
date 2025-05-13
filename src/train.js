// ─── 간이 역간 소요시간표 (일반열차 상선 기준) ───
const segmentTimes = {
  "개화→김포공항": 3,
  "김포공항→공항시장": 2,
  "공항시장→신방화": 2,
  "신방화→마곡나루": 2,
  "마곡나루→양천향교": 2,
  "양천향교→가양": 2,
  "가양→증미": 2,
  "증미→등촌": 2,
  "등촌→염창": 2,
  "염창→신목동": 2,
  "신목동→선유도": 2,
  "선유도→당산": 2
};

// ─── 경로 기반 열차 위치 퍼센트 계산 ───
function getProgressByRoute(train, segmentTimes) {
  const route = train.경로;
  const current = train.현위치역;
  const next = train.다음역;
  const timeLeft = train.다음까지남은시간;

  let total = 0;
  let progressed = 0;
  let reachedCurrent = false;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    const key = `${from}→${to}`;
    const segmentTime = segmentTimes[key] || 2;

    total += segmentTime;

    if (from === current && to === next) {
      progressed += (segmentTime - timeLeft);
      reachedCurrent = true;
    } else if (!reachedCurrent) {
      progressed += segmentTime;
    }
  }

  const pct = Math.max(0, Math.min(100, (progressed / total) * 100));
  return pct;
}

// ─── 메인 로직 ───
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
      console.log("📦 응답 데이터:", rawText);

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

      // 기존 아이콘 제거 (새로 그림)
      document.querySelectorAll(".station .train-icon").forEach(icon => icon.remove());

      trains.forEach((train) => {
        const pct = getProgressByRoute(train, segmentTimes);
        console.log(`📍 ${train.현위치역}→${train.다음역} 진행률: ${pct.toFixed(1)}%`);

        // 노선도에서 .station-name과 매칭해서 train_icon 표시
   document.querySelectorAll(".station").forEach(stationEl => {
  const nameEl = stationEl.querySelector(".station-name");
  if (nameEl && nameEl.textContent.trim() === train.현위치역.trim()) {
    const icon = document.createElement("img");
    icon.src = "https://jangteam825.github.io/maintrans9/assets/train_icon.png";
    icon.alt = "열차";
    icon.className = "train-icon";
    icon.style.width = "20px";
    icon.style.position = "absolute";
    icon.style.top = "-24px"; // 점 위로 띄우기
    icon.style.left = "50%";
    icon.style.transform = "translateX(-50%)";

    const dot = stationEl.querySelector(".station-dot") || stationEl;
    dot.appendChild(icon);
  }
});


    } catch (err) {
      console.error(`❌ 업로드 실패:`, err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});
