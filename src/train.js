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

    let trains = [];

    try {
      const res = await fetch(
        'https://maintrans9-upload-6e3ba659a8bc.herokuapp.com/api/process',
        { method: 'POST', body: form, mode: 'cors' }
      );

      const rawText = await res.text();
      console.log('📦 응답 데이터:', rawText);

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`);
      }

      try {
        trains = JSON.parse(rawText);
        if (!Array.isArray(trains)) {
          console.error('❌ 유효하지 않은 열차 데이터 형식:', trains);
          status.textContent = '서버 응답 오류 (데이터 형식 오류)';
          status.style.color = 'red';
          return;
        }
      } catch (parseErr) {
        console.error('❌ JSON 파싱 실패:', parseErr, rawText);
        status.textContent = '서버 응답 오류 (파싱 실패)';
        status.style.color = 'red';
        return;
      }

      status.textContent = '업로드 및 분석 성공';
      status.style.color = 'blue';

      // 기존 선로 그리기 초기화
      ['up', 'down'].forEach(dir => {
        const container = document.getElementById(dir === 'up' ? 'upLine' : 'downLine');
        container.innerHTML = ''; // 초기화
      });

      // 열차 시각화
      trains.forEach(train => {
        console.log(`🚄 열차: ${train.trainNumber}, ${train.departure}→${train.arrival}, ${train.type}`);
        // 실제 시각화 그리는 로직은 여기에 삽입
      });

    } catch (err) {
      console.error(`❌ 업로드 실패:`, err);
      status.textContent = '업로드 실패: ' + err.message;
      status.style.color = 'red';
    }
  });
});
