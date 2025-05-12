// ─── train.js ───

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
      console.log('🚆 수신된 열차 데이터:', trains); // 📌 디버깅용 로그
      status.textContent = '업로드 및 분석 성공';

      ['up', 'down'].forEach(dir => {
        const container = document.getElementById(dir === 'up' ? 'up-line' : 'down-line');
        const iconLayer = container.querySelector('.train-icons');
        if (!iconLayer) {
          console.warn(`❗ ${dir}-line에 .train-icons 없음`);
          return;
        }

        iconLayer.innerHTML = '';

        trains
          .filter(train => train.direction === dir)
          .forEach(train => {
            console.log(`📦 열차 (${dir}):`, train); // 📌 개별 열차 확인

            if (!train.departure || !train.arrival) {
              console.warn('❗ dep/arr 없음:', train);
              return;
            }
            if (!Array.isArray(train.stationTimes)) {
              console.warn('❗ stationTimes 없음:', train);
              return;
            }

            const pct = getProgressPercentage(train.departure, train.arrival);
            console.log(`📍 ${train.departure}→${train.arrival} 진행률: ${pct.toFixed(1)}%`);

            const img = document.createElement('img');
            img.src = 'assets/train_icon.png';
            img.className = 'train';
            img.style.left = pct + '%';
            iconLayer.append(img);
          });
      });

    } catch (err) {
      console.error('❌ 업로드 실패:', err);
      status.textContent = '업로드 실패: ' + err.message;
      status.style.color = 'red';
    }
  });
});

function getProgressPercentage(dep, arr) {
  if (typeof dep !== 'string' || typeof arr !== 'string') return 0;
  const [dh, dm] = dep.split(':').map(Number);
  const [ah, am] = arr.split(':').map(Number);
  const depDate = new Date(0, 0, 0, dh, dm);
  let arrDate = new Date(0, 0, 0, ah, am);

  if (arrDate <= depDate) arrDate.setDate(arrDate.getDate() + 1);

  const now = new Date();
  const nowDate = new Date(0, 0, 0, now.getHours(), now.getMinutes());

  const total = (arrDate - depDate) / 60000;
  const elapsed = (nowDate - depDate) / 60000;

  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}
