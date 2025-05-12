// train.js

// 특정 구간의 경과율을 계산합니다.
function getProgressPercentage(dep, arr) {
  const depT = new Date(`1970-01-01T${dep}:00`);
  const arrT = new Date(`1970-01-01T${arr}:00`);
  const total = (arrT - depT) / 60000;
  const now = new Date();
  const elapsed = (now - depT) / 60000;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

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
      const trains = await res.json();

      status.textContent = "업로드 및 분석 성공";

      ["up-line", "down-line"].forEach((id) => {
        const layer = document
          .getElementById(id)
          .querySelector(".train-icons");
        layer.innerHTML = "";
        trains.forEach((train) => {
          const pct = getProgressPercentage(
            train.departure,
            train.arrival
          );
          const img = document.createElement("img");
          img.src = "train-icon.png";  // 프로젝트 루트에 위치
          img.className = "train";
          img.style.left = pct + "%";
          layer.appendChild(img);
        });
      });
    } catch (err) {
      console.error(err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});
