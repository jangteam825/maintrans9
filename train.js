// train.js

//— 1) 시간 계산 헬퍼 (업데이트 주기마다 재계산)
function getProgressPercentage(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  const depT = new Date(); depT.setHours(dh, dm, 0, 0);
  const arrT = new Date(); arrT.setHours(ah, am, 0, 0);
  const totalMin = (arrT - depT) / 60000;
  const nowMin   = (Date.now() - depT) / 60000;
  return Math.max(0, Math.min(100, (nowMin / totalMin) * 100));
}

document.addEventListener("DOMContentLoaded", () => {
  const upload = document.getElementById("excelUpload");
  const status = document.getElementById("uploadStatus");
  const stationEls = {};  // { "up-당산": HTMLElement, ... }

  //— 2) station 요소 미리 모아두기
  document.querySelectorAll("#up-line .station").forEach(el => {
    const name = el.querySelector(".station-name").textContent.trim();
    stationEls["up-" + name] = el;
  });
  document.querySelectorAll("#down-line .station").forEach(el => {
    const name = el.querySelector(".station-name").textContent.trim();
    stationEls["down-" + name] = el;
  });

  upload.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    status.textContent = "업로드 중…"; status.style.color = "green";
    const form = new FormData(); form.append("file", file);

    try {
      const res = await fetch(
        "https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process",
        { method: "POST", body: form, mode: "cors" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const trains = await res.json();  // 서버에서 [{ direction, stationTimes: [{station, time},…] , …}, …]

      status.textContent = "업로드 및 분석 성공"; 
      
      //— 3) 화면 갱신 함수
      function render() {
        // 3-1) 타이머 초기화: 모든 station-time 비우기
        Object.values(stationEls).forEach(stEl => {
          stEl.querySelector(".station-time").textContent = "";
        });
        // 3-2) 아이콘 레이어 초기화
        ["up","down"].forEach(dir => {
          const layer = document
            .getElementById(dir === "up" ? "up-line" : "down-line")
            .querySelector(".train-icons");
          layer.innerHTML = "";
        });

        // 3-3) 각 열차마다
        trains.forEach(train => {
          const dir = train.direction; // "up" or "down"
          const times = train.stationTimes; 

          // — (1) 당산/중앙보훈병원에 도착시간 표시
          ["당산", "중앙보훈병원"].forEach(name => {
            const rec = times.find(s => s.station === name);
            if (rec) {
              const el = stationEls[dir + "-" + name];
              el.querySelector(".station-time").textContent = `도착 ${rec.time}`;
            }
          });

          // — (2) 아이콘 그리기
          const depName = dir === "up" ? "개화" : "중앙보훈병원";
          const arrName = dir === "up" ? "중앙보훈병원" : "개화";
          const depRec = times.find(s => s.station === depName);
          const arrRec = times.find(s => s.station === arrName);
          if (!depRec || !arrRec) return;

          const pct = getProgressPercentage(depRec.time, arrRec.time);
          const img = new Image();
          img.src = "assets/train_icon.png";   // assets 폴더 아래 train_icon.png
          img.className = "train";
          img.style.left = pct + "%";
          document
            .getElementById(dir === "up" ? "up-line" : "down-line")
            .querySelector(".train-icons")
            .appendChild(img);
        });
      }

      // 최초 한 번 렌더
      render();
      // 옵션: 30초마다 위치 갱신
      setInterval(render, 30 * 1000);

    } catch (err) {
      console.error(err);
      status.textContent = "업로드 실패: " + err.message;
      status.style.color = "red";
    }
  });
});
