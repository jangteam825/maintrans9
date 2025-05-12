// ─── train.js ───
// 1) 업로드 버튼 & API 호출 + 열차 그리기
window.addEventListener('DOMContentLoaded', () => {
  const upload = document.getElementById('excelUpload');
  const status = document.getElementById('uploadStatus');

  upload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    status.textContent = '업로드 중…';
    status.style.color = 'green';

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(
        'https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process',
        { method: 'POST', body: form, mode: 'cors' }
      );
      if (!res.ok) throw new Error(res.statusText);
      const trains = await res.json();
      status.textContent = '업로드 및 분석 성공';

      ['up', 'down'].forEach(dir => {
        const container = document.getElementById(dir === 'up' ? 'up-line' : 'down-line');
        const iconLayer = container.querySelector('.train-icons');
        iconLayer.innerHTML = '';

        trains.forEach(train => {
          if (!train.departure || !train.arrival) return;
          if (!Array.isArray(train.stationTimes)) return;

          const pct = getProgressPercentage(train.departure, train.arrival);
          const img = document.createElement('img');
          img.src = 'assets/train_icon.png';
          img.className = 'train';
          img.style.left = pct + '%';
          iconLayer.append(img);
        });
      });

    } catch (err) {
      console.error(err);
      status.textContent = '업로드 실패: ' + err.message;
      status.style.color = 'red';
    }
  });
});

// 2) helper: HH:MM → 0~100%
function getProgressPercentage(dep, arr) {
  if (typeof dep !== 'string' || typeof arr !== 'string') return 0;
  const [dh, dm] = dep.split(':').map(Number);
  const [ah, am] = arr.split(':').map(Number);
  const depDate = new Date(0,0,0, dh, dm);
  const arrDate = new Date(0,0,0, ah, am);
  const total = (arrDate - depDate) / 60000;
  const now = new Date();
  const nowMin = (now.getHours()*60 + now.getMinutes()) - (dh*60 + dm);
  return Math.max(0, Math.min(100, (nowMin/total)*100));
}
