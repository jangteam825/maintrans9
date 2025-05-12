// ─── train.js ───
document.addEventListener("DOMContentLoaded", () => {
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
      const res = await fetch(
        "https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process",
        { method: "POST", body: form, mode: "cors" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const trains = await res.json();  // [{ departure, arrival, trainId, stationTimes: [{ station, minutes }, …] }, …]

      status.textContent = "업로드 및 분석 성공";

      ["up", "down"].forEach((dir) => {
        // up-line / down-line 컨테이너
        const container = document.getElementById(dir === "up" ? "up-line" : "down-line");
        const iconLayer = container.querySelector(".train-icons");
        iconLayer.innerHTML = ""; // 기존 아이콘 초기화

        trains.forEach((train) => {
          // 1) 필수 필드 검사
          if (!train.departure || !train.arrival) {
            console.warn("Missing departure/arrival:", train);
            return;
          }
          if (!Array.isArray(train.stationTimes)) {
            console.warn("Missing stationTimes:", train);
            return;
          }

          // 2) 역별 도착예정분 업데이트
          train.stationTimes.forEach((st) => {
            const stationEls = container.querySelectorAll(".station");
            stationEls.forEach((el) => {
              const nameEl = el.querySelector(".station-name");
              if (nameEl.textContent.trim() === st.station.trim()) {
                el.querySelector(".station-time").textContent = `도착까지 ${st.minutes}분`;
              }
            });
          });

          // 3) 현재 진행 퍼센트 계산 후 아이콘 생성
          const pct = getProgressPercentage(train.departure, train.arrival);
          const img = document.createElement("img");
          img.src = "assets/train_icon.png";  // assets 폴더에 올려둔 아이콘
          img.className = "train";
          img.style.left = pct + "%";
          iconLayer.append(img);
        });
      });
    } catch (err) {
      console.error(err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});

// ─── 헬퍼: "HH:MM" → 0~100 사이 퍼센티지 계산 ───
function getProgressPercentage(dep, arr) {
  if (typeof dep !== "string" || typeof arr !== "string") {
    console.warn("invalid dep/arr:", dep, arr);
    return 0;
  }
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  const depDate = new Date(0, 0, 0, dh, dm);
  const arrDate = new Date(0, 0, 0, ah, am);
  const total = (arrDate - depDate) / 60000; // 총 소요분
  const now = new Date();
  // 출발 기준으로 지금까지 흐른 분
  const nowMin = now.getHours() * 60 + now.getMinutes() - (dh * 60 + dm);
  const pct = (nowMin / total) * 100;
  return Math.max(0, Math.min(100, pct));
}
