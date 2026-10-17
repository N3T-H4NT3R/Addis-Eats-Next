"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const courierIcon = L.divIcon({
  className: "delivery-map-marker",
  html: '<span class="delivery-map-marker__courier" aria-hidden="true">●</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const deliveryIcon = L.divIcon({
  className: "delivery-map-marker",
  html: '<span class="delivery-map-marker__destination" aria-hidden="true">⌖</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function FitMarkers({ routeStart, courier, delivery, isDelivering }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds([routeStart, delivery], { padding: [48, 48], maxZoom: 15 });
  }, [routeStart, delivery, map]);

  useEffect(() => {
    if (isDelivering) map.panTo(courier, { animate: true, duration: 0.7 });
  }, [courier, isDelivering, map]);

  return null;
}

export default function DeliveryMap({ routeStart, courier, delivery, deliveryAddress, isDelivering }) {
  return (
    <div className="delivery-map relative z-0 isolate" aria-label="Map showing courier and delivery address">
      <MapContainer
        center={delivery}
        zoom={13}
        scrollWheelZoom={false}
        className="relative z-0 h-[380px] w-full rounded-xl sm:h-[460px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMarkers routeStart={routeStart} courier={courier} delivery={delivery} isDelivering={isDelivering} />
        <Marker position={courier} icon={courierIcon}>
          <Tooltip permanent direction="top">Courier</Tooltip>
        </Marker>
        <Marker position={delivery} icon={deliveryIcon}>
          <Tooltip permanent direction="top">Delivery address</Tooltip>
        </Marker>
      </MapContainer>
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-3 py-3 text-sm text-gray-300" aria-hidden="true">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-green-400" />Courier</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-red-400" />{deliveryAddress}</span>
      </div>
    </div>
  );
}