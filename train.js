// ─── train.js ───
…  
fetch(…)
  .then(res => res.json())
  .then(trains => {
-   trains.forEach(train => {
+   trains.forEach(train => {
+     // departure 또는 arrival 둘 중 하나라도 없으면 스킵
+     if (!train.departure || !train.arrival) {
+       console.warn("Missing departure/arrival:", train);
+       return;
+     }
+     // stationTimes 배열이 없거나 비정상이면 스킵
+     if (!Array.isArray(train.stationTimes)) {
+       console.warn("Missing stationTimes:", train);
+       return;
+     }
train.js
// —————————————————————————————————————————
// helper: "HH:MM" 문자열을 받아서 0~100 사이의 퍼센티지로 리턴
function getProgressPercentage(dep, arr) {
  if (typeof dep !== "string" || typeof arr !== "string") {
    console.warn("invalid dep/arr:", dep, arr);
    return 0;
  }
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  const depT = new Date(1970, 0, 1, dh, dm);
  const arrT = new Date(1970, 0, 1, ah, am);
  const totalM = (arrT - depT) / 60000;
  const now = new Date();
  const elapsedM = (now - depT) / 60000;
  return Math.min(100, Math.max(0, (elapsedM / totalM) * 100));
}

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
      const res = await fetch(
        "https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process",
        { method: "POST", body: form, mode: "cors" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const trains = await res.json();

      console.log("🚆 서버에서 받은 trains:", trains);

      status.textContent = "업로드 및 분석 성공";

      ["up", "down"].forEach((dir) => {
        const container = document.getElementById(
          dir === "up" ? "up-line" : "down-line"
        );
        if (!container) {
          console.error("Container not found for", dir);
          return;
        }

        const iconLayer = container.querySelector(".train-icons");
        if (!iconLayer) {
          console.error(".train-icons layer missing in", container);
          return;
        }
        iconLayer.innerHTML = ""; // 초기화

        trains.forEach((train) => {
          // 서버에서 내려주는 키를 정확히 써야 합니다.
          // 예: train.departure, train.arrival
          if (!train.departure || !train.arrival) {
            console.warn("skip train, missing times:", train);
            return;
          }

          const pct = getProgressPercentage(
            train.departure,
            train.arrival
          );
          const img = document.createElement("img");
          img.src = "assets/train_icon.png";
          img.className = "train";
          img.style.left = pct + "%";
          iconLayer.appendChild(img);
        });
      });
    } catch (err) {
      console.error(err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});
