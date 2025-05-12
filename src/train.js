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

    const rawText = await res.text();
    let trains = [];

    try {
      trains = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('❌ JSON 파싱 실패:', parseErr, rawText);
      status.textContent = '서버 응답 오류 (파싱 실패)';
      status.style.color = 'red';
      return;
    }

    console.log('🚆 수신된 열차 데이터:', trains); // ✅ 이 시점에 trains는 정의됨
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
          console.log(`📦 열차 (${dir}):`, train);

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
