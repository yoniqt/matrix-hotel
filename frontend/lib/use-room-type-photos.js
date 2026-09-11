"use client";

import { useEffect, useState } from "react";
import { ROOM_TYPE_IMAGES, ROOM_TYPE_GALLERY } from "./room-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetches admin-uploaded room-type photos once and falls back to the
// bundled defaults for any type with no uploads yet, so the site never
// shows a blank gallery just because nobody's uploaded real photos.
export function useRoomTypePhotos() {
  const [uploaded, setUploaded] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/room-types/photos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUploaded(data.data);
      })
      .catch(() => {
        // Falls back to bundled defaults below - not worth surfacing an
        // error just for missing bonus photos.
      });
  }, []);

  function getGallery(roomType) {
    const photos = uploaded[roomType];
    if (photos && photos.length > 0) return photos.map((p) => p.url);
    return ROOM_TYPE_GALLERY[roomType] || [];
  }

  function getImage(roomType) {
    return getGallery(roomType)[0] || ROOM_TYPE_IMAGES.Standard;
  }

  return { getImage, getGallery };
}
