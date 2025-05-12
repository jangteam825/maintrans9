
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("excelUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const now = new Date();

    json.forEach(train => {
      const stationName = train["도착역"] || train["to"];
      const timeStr = train["도착시각"] || train["arrivalTime"] || train["출발시각"] || train["departureTime"];

      if (!stationName || !timeStr) return;

      const [hh, mm] = timeStr.split(":").map(Number);
      const arrival = new Date();
      arrival.setHours(hh, mm, 0, 0);

      const diffMin = Math.floor((arrival - now) / 60000);
      if (diffMin < 0) return;

      // DOM에서 해당 역 찾아서 .station-time 업데이트
      document.querySelectorAll(".station").forEach(stationEl => {
        const nameEl = stationEl.querySelector(".station-name");
        const timeEl = stationEl.querySelector(".station-time");

        if (nameEl && nameEl.textContent.trim() === stationName.trim()) {
          timeEl.textContent = `도착까지 ${diffMin}분`;
        }
      });
    });
  });
});
