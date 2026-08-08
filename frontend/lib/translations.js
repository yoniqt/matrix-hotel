// A small, scoped translation set covering the main visible navigation and
// marketing text - not a full translation of every string on the site
// (room descriptions, policies, etc. stay in English). Good enough to make
// switching languages feel real for the highest-visibility text.
export const TRANSLATIONS = {
  English: {
    tagline: "Get luxury and comfort",
    headline: "Discover Your Perfect Stay at The Matrix Hotel",
    home: "Home",
    about: "About",
    rooms: "Rooms",
    contact: "Contact",
    contactUs: "Contact Us",
    search: "Search",
    searching: "Searching...",
    bookThisRoom: "Book this room",
    backToResults: "← Back to search results",
  },
  Filipino: {
    tagline: "Karanasang Maluho at Komportable",
    headline: "Tuklasin ang Perpektong Tuluyan sa The Matrix Hotel",
    home: "Home",
    about: "Tungkol Sa Amin",
    rooms: "Mga Kwarto",
    contact: "Makipag-ugnayan",
    contactUs: "Makipag-ugnayan",
    search: "Maghanap",
    searching: "Naghahanap...",
    bookThisRoom: "I-book ang Kwartong Ito",
    backToResults: "← Bumalik sa resulta ng paghahanap",
  },
  "中文 (Chinese)": {
    tagline: "尽享奢华与舒适",
    headline: "在矩阵酒店发现您的完美住宿",
    home: "首页",
    about: "关于我们",
    rooms: "客房",
    contact: "联系我们",
    contactUs: "联系我们",
    search: "搜索",
    searching: "搜索中...",
    bookThisRoom: "预订此房间",
    backToResults: "← 返回搜索结果",
  },
  "日本語 (Japanese)": {
    tagline: "ラグジュアリーと快適さを",
    headline: "ザ・マトリックス・ホテルで最高の滞在を",
    home: "ホーム",
    about: "私たちについて",
    rooms: "客室",
    contact: "お問い合わせ",
    contactUs: "お問い合わせ",
    search: "検索",
    searching: "検索中...",
    bookThisRoom: "この部屋を予約する",
    backToResults: "← 検索結果に戻る",
  },
  "한국어 (Korean)": {
    tagline: "럭셔리와 편안함을 만나보세요",
    headline: "더 매트릭스 호텔에서 완벽한 숙박을 경험하세요",
    home: "홈",
    about: "소개",
    rooms: "객실",
    contact: "문의하기",
    contactUs: "문의하기",
    search: "검색",
    searching: "검색 중...",
    bookThisRoom: "이 객실 예약하기",
    backToResults: "← 검색 결과로 돌아가기",
  },
};

export function t(language, key) {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.English[key];
}
