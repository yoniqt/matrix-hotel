export const ROOM_TYPE_IMAGES = {
  Standard: "/images/rooms/standard.webp",
  Deluxe: "/images/rooms/deluxe.webp",
  Suite: "/images/rooms/suite.jpg",
  Family: "/images/rooms/family.jpg",
};

export function roomImage(room) {
  return ROOM_TYPE_IMAGES[room.room_type] || "/images/rooms/standard.webp";
}

export const ROOM_TYPE_DESCRIPTIONS = {
  Standard:
    "A cozy, comfortable room with everything you need for a relaxing stay - perfect for solo travelers or couples.",
  Deluxe:
    "A more spacious room with upgraded furnishings and a better view, ideal for guests wanting extra comfort.",
  Suite:
    "A generous suite with a separate living area, perfect for longer stays or small families who want more room to unwind.",
  Family:
    "Our largest room, built for bigger groups and families - plenty of space and beds for everyone to stay together.",
};

// In-room amenities, separate from the hotel-wide amenities (gym/pool/bar).
export const ROOM_TYPE_AMENITIES = {
  Standard: [
    "Free Wi-Fi",
    "Air conditioning",
    "Flat-screen TV",
    "Private bathroom",
    "Daily housekeeping",
    "Hair dryer",
    "Free bath towels",
  ],
  Deluxe: [
    "Free Wi-Fi",
    "Air conditioning",
    "Flat-screen TV",
    "Private bathroom",
    "Daily housekeeping",
    "Hair dryer",
    "Free bath towels",
    "Mini bar",
    "Work desk",
    "City view",
  ],
  Suite: [
    "Free Wi-Fi",
    "Air conditioning",
    "Flat-screen TV",
    "Private bathroom",
    "Daily housekeeping",
    "Hair dryer",
    "Free bath towels",
    "Mini bar",
    "Separate living area",
    "Bathtub",
    "Premium toiletries",
  ],
  Family: [
    "Free Wi-Fi",
    "Air conditioning",
    "Flat-screen TV",
    "Private bathroom",
    "Daily housekeeping",
    "Hair dryer",
    "Free bath towels",
    "Mini bar",
    "Separate living area",
    "Extra beds available",
    "Kid-friendly amenities",
  ],
};

// Simple emoji icons per amenity - keeps this reliable (no external icon
// files that could fail to load) while still being visually distinct from
// plain bullet dots.
export const AMENITY_ICONS = {
  "Free Wi-Fi": "📶",
  "Air conditioning": "❄️",
  "Flat-screen TV": "📺",
  "Private bathroom": "🚿",
  "Daily housekeeping": "🧹",
  "Hair dryer": "💨",
  "Free bath towels": "🧺",
  "Mini bar": "🍾",
  "Work desk": "🖥️",
  "City view": "🏙️",
  "Separate living area": "🛋️",
  Bathtub: "🛁",
  "Premium toiletries": "🧴",
  "Extra beds available": "🛏️",
  "Kid-friendly amenities": "🧸",
};

export const CHECK_IN_OUT_POLICY = {
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  lateCheckoutHours: "Until 3:00 PM (on request, subject to availability)",
  lateCheckoutFee: "50% of nightly rate",
};

// Groups individual physical rooms (Room 101, Room 102, ...) into one card
// per room TYPE, since guests book a type of room, not a specific numbered
// room - two identical Standard rooms don't need two separate listings.
export function groupRoomsByType(rooms) {
  const groups = new Map();
  for (const room of rooms) {
    if (!groups.has(room.room_type)) {
      groups.set(room.room_type, { ...room, availableCount: 0, roomIds: [] });
    }
    const group = groups.get(room.room_type);
    group.availableCount += 1;
    group.roomIds.push(room.id);
  }
  return Array.from(groups.values());
}

export function roomTypeToSlug(type) {
  return type.toLowerCase();
}

export function slugToRoomType(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}
