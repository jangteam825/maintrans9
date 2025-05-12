// ─── train.js ───

// 1) 서버에서 행로표 데이터를 받아와서 처리
document.addEventListener("DOMContentLoaded", () => {
  const upload = document.getElementById("excelUpload");
  const status = document.getElementById("uploadStatus");

  upload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    status.textContent = "업로드 중…"; status.style.color = "green";
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(
        "https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process",
        { method: "POST", body: form, mode: "cors" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const trains = await res.json();

      status.textContent = "업로드 및 분석 성공";

      // 상/하선 각각 처리
      ["up","down"].forEach(dir => {
        const container = document.getElementById(
          dir === "up" ? "up-line" : "down-line"
        );
        const iconLayer = container.querySelector(".train-icons");
        iconLayer.innerHTML = ""; // 초기화

        trains.forEach(train => {
          // departure/arrival/stationTimes 유효성 검사
          if (!train.departure || !train.arrival) {
            console.warn("Missing dep/arr:", train);
            return;
          }
          if (!Array.isArray(train.stationTimes)) {
            console.warn("Missing stationTimes:", train);
            return;
          }

          // 0~100% 위치 계산
          const pct = getProgressPercentage(
            train.departure,
            train.arrival
          );

          // 아이콘 생성
          const img = document.createElement("img");
          img.src = "assets/train_icon.png";  // assets 폴더에 있는 기차 아이콘
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

// 2) 헬퍼 함수: "HH:MM" 문자열을 받아서 0~100사이 퍼센티지 계산
function getProgressPercentage(dep, arr) {
  if (typeof dep !== "string" || typeof arr !== "string") {
    console.warn("invalid dep/arr:", dep, arr);
    return 0;
  }
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  const depDate = new Date(0,0,0, dh, dm);
  const arrDate = new Date(0,0,0, ah, am);
  const total = (arrDate - depDate) / 60000; // 분
  const now = new Date();
  const nowMin = (now.getHours()*60 + now.getMinutes()) - (dh*60 + dm);
  const pct = (nowMin / total) * 100;
  return Math.max(0, Math.min(100, pct));
}
