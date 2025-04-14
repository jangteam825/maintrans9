import React from 'react';
import RouteMap from './components/RouteMap';
import TrainTracker from './components/TrainTracker';

function App() {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🚇 9호선 실시간 차량 시각화</h1>
      <RouteMap />
      <TrainTracker />
    </div>
  );
}

export default App;