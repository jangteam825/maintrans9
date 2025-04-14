import React from 'react';

const stations = ['개화', '김포공항', '염창', '당산', '노들', '동작', '보훈병원'];

export default function RouteMap() {
  return (
    <div className="flex gap-6 items-center">
      {stations.map((station, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-4 h-4 bg-black rounded-full mb-1"></div>
          <span className="text-sm">{station}</span>
        </div>
      ))}
    </div>
  );
}