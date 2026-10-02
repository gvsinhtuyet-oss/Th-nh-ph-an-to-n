export type Grade = 1 | 2 | 3 | 4 | 5;

export interface StudentStationConfig {
  grade: Grade;
  order: number;          // Trạm 1/5...
  areaId: string;
  areaName: string;
  areaIcon: string;

  stationTitle: string;   // tên game hóa học sinh thấy

  // Chỉ để đối chiếu / hiển thị khi mở nguồn
  sourceLessonTitle: string;
  sourceSections: string[];
}

export const STUDENT_STATIONS: StudentStationConfig[] = [
  // =====================================================
  // CẤP 1 — 5 TRẠM
  // =====================================================
  {
    grade: 1,
    order: 1,
    areaId: "g1-school-road",
    areaName: "Đường đến trường",
    areaIcon: "🏫",
    stationTitle: "Con đường quen thuộc",
    sourceLessonTitle: "Bài 1 – Đường em tới trường",
    sourceSections: [
      "1.1 Tìm hiểu về đường đến trường",
      "1.2 Đèn tín hiệu giao thông",
    ],
  },
  {
    grade: 1,
    order: 2,
    areaId: "g1-school-road",
    areaName: "Đường đến trường",
    areaIcon: "🏫",
    stationTitle: "Mật mã giao thông quanh em",
    sourceLessonTitle: "Bài 1 – Đường em tới trường",
    sourceSections: [
      "Người điều khiển giao thông",
      "1.3 Vạch đi bộ qua đường",
      "1.4 Các loại phương tiện giao thông",
    ],
  },
  {
    grade: 1,
    order: 3,
    areaId: "g1-passenger",
    areaName: "Hành khách nhí",
    areaIcon: "🛵",
    stationTitle: "Bạn nhỏ ngồi xe đạp",
    sourceLessonTitle: "Bài 3 – Đi xe đạp an toàn",
    sourceSections: ["3.1 Ngồi sau xe đạp an toàn"],
  },
  {
    grade: 1,
    order: 4,
    areaId: "g1-passenger",
    areaName: "Hành khách nhí",
    areaIcon: "🛵",
    stationTitle: "Chiếc mũ bảo vệ em",
    sourceLessonTitle: "Bài 4 – Ngồi sau xe máy an toàn",
    sourceSections: [
      "Đội mũ bảo hiểm và cài quai đúng quy cách",
    ],
  },
  {
    grade: 1,
    order: 5,
    areaId: "g1-passenger",
    areaName: "Hành khách nhí",
    areaIcon: "🛵",
    stationTitle: "Ngồi xe máy thật an toàn",
    sourceLessonTitle: "Bài 4 – Ngồi sau xe máy an toàn",
    sourceSections: ["Ngồi sau xe máy an toàn"],
  },

  // =====================================================
  // CẤP 2 — 5 TRẠM
  // =====================================================
  {
    grade: 2,
    order: 1,
    areaId: "g2-walking",
    areaName: "Bước chân an toàn",
    areaIcon: "🚶",
    stationTitle: "Bước chân đúng đường",
    sourceLessonTitle: "Bài 2 – Đi bộ và qua đường an toàn",
    sourceSections: ["2.1 Đi bộ trên đường an toàn"],
  },
  {
    grade: 2,
    order: 2,
    areaId: "g2-walking",
    areaName: "Bước chân an toàn",
    areaIcon: "🚶",
    stationTitle: "Thử thách đường sắt",
    sourceLessonTitle: "Bài 2 – Đi bộ và qua đường an toàn",
    sourceSections: [
      "2.2 Đi bộ ở nơi đường bộ giao với đường sắt",
    ],
  },
  {
    grade: 2,
    order: 3,
    areaId: "g2-walking",
    areaName: "Bước chân an toàn",
    areaIcon: "🚶",
    stationTitle: "Qua đường thông minh",
    sourceLessonTitle: "Bài 2 – Đi bộ và qua đường an toàn",
    sourceSections: ["2.3 Đi bộ qua đường an toàn"],
  },
  {
    grade: 2,
    order: 4,
    areaId: "g2-car",
    areaName: "Khoang xe an toàn",
    areaIcon: "🚗",
    stationTitle: "Chiếc đai bảo vệ",
    sourceLessonTitle: "Bài 5 – Ngồi an toàn trong xe ô tô",
    sourceSections: [
      "5.1 Sử dụng dây đai an toàn dành cho xe ô tô",
    ],
  },
  {
    grade: 2,
    order: 5,
    areaId: "g2-car",
    areaName: "Khoang xe an toàn",
    areaIcon: "🚗",
    stationTitle: "Hành khách nhí an toàn",
    sourceLessonTitle: "Bài 5 – Ngồi an toàn trong xe ô tô",
    sourceSections: ["5.2 Ngồi an toàn trong xe ô tô"],
  },

  // =====================================================
  // CẤP 3 — 5 TRẠM
  // =====================================================
  {
    grade: 3,
    order: 1,
    areaId: "g3-bike",
    areaName: "Xe đạp an toàn",
    areaIcon: "🚲",
    stationTitle: "Chọn xe đúng chuẩn",
    sourceLessonTitle: "Bài 3 – Đi xe đạp an toàn",
    sourceSections: ["3.2 Chọn xe an toàn"],
  },
  {
    grade: 3,
    order: 2,
    areaId: "g3-bike",
    areaName: "Xe đạp an toàn",
    areaIcon: "🚲",
    stationTitle: "Tay lái an toàn",
    sourceLessonTitle: "Bài 3 – Đi xe đạp an toàn",
    sourceSections: ["3.3 Điều khiển xe đạp an toàn"],
  },
  {
    grade: 3,
    order: 3,
    areaId: "g3-bike",
    areaName: "Xe đạp an toàn",
    areaIcon: "🚲",
    stationTitle: "Qua đường thông minh",
    sourceLessonTitle: "Bài 3 – Đi xe đạp an toàn",
    sourceSections: [
      "3.4 Điều khiển xe đạp qua đường an toàn",
    ],
  },
  {
    grade: 3,
    order: 4,
    areaId: "g3-public-transport",
    areaName: "Phương tiện công cộng",
    areaIcon: "🚌",
    stationTitle: "Hành khách xe buýt văn minh",
    sourceLessonTitle: "Bài 6 – An toàn khi đi xe buýt, tàu hỏa",
    sourceSections: ["6.1 An toàn khi đi xe buýt"],
  },
  {
    grade: 3,
    order: 5,
    areaId: "g3-public-transport",
    areaName: "Phương tiện công cộng",
    areaIcon: "🚌",
    stationTitle: "Chuyến tàu an toàn",
    sourceLessonTitle: "Bài 6 – An toàn khi đi xe buýt, tàu hỏa",
    sourceSections: ["6.2 An toàn khi đi tàu hỏa"],
  },

  // =====================================================
  // CẤP 4 — 4 TRẠM
  // =====================================================
  {
    grade: 4,
    order: 1,
    areaId: "g4-water",
    areaName: "Hành trình đường thủy",
    areaIcon: "⛴️",
    stationTitle: "Lá chắn áo phao",
    sourceLessonTitle:
      "Bài 7 – An toàn khi đi trên phương tiện giao thông đường thủy",
    sourceSections: [
      "7.1 Cách mặc áo phao cứu sinh, sử dụng dụng cụ nổi cứu sinh cá nhân",
    ],
  },
  {
    grade: 4,
    order: 2,
    areaId: "g4-water",
    areaName: "Hành trình đường thủy",
    areaIcon: "⛴️",
    stationTitle: "Vượt sóng an toàn",
    sourceLessonTitle:
      "Bài 7 – An toàn khi đi trên phương tiện giao thông đường thủy",
    sourceSections: [
      "7.2 An toàn khi đi trên thuyền, đò, phà",
      "7.3 Một số hành vi nguy hiểm khi đi thuyền, đò, phà",
    ],
  },
  {
    grade: 4,
    order: 3,
    areaId: "g4-signs",
    areaName: "Mật mã biển báo",
    areaIcon: "🚦",
    stationTitle: "Giải mã nhóm biển báo",
    sourceLessonTitle: "Bài 8 – Biển báo hiệu giao thông đường bộ",
    sourceSections: [
      "8.1 Các nhóm biển báo hiệu giao thông đường bộ",
    ],
  },
  {
    grade: 4,
    order: 4,
    areaId: "g4-signs",
    areaName: "Mật mã biển báo",
    areaIcon: "🚦",
    stationTitle: "Thám tử biển báo",
    sourceLessonTitle: "Bài 8 – Biển báo hiệu giao thông đường bộ",
    sourceSections: ["8.2 Một số biển báo hiệu cơ bản"],
  },

  // =====================================================
  // CẤP 5 — 5 TRẠM
  // =====================================================
  {
    grade: 5,
    order: 1,
    areaId: "g5-risk",
    areaName: "Nhận diện nguy cơ",
    areaIcon: "⚠️",
    stationTitle: "Đi tìm nguyên nhân",
    sourceLessonTitle:
      "Bài 9 – Hậu quả của tai nạn giao thông đường bộ",
    sourceSections: [
      "9.1 Tìm hiểu về tai nạn giao thông đường bộ",
    ],
  },
  {
    grade: 5,
    order: 2,
    areaId: "g5-risk",
    areaName: "Nhận diện nguy cơ",
    areaIcon: "⚠️",
    stationTitle: "Một giây bất cẩn",
    sourceLessonTitle:
      "Bài 9 – Hậu quả của tai nạn giao thông đường bộ",
    sourceSections: [
      "9.2 Hậu quả của tai nạn giao thông đường bộ",
    ],
  },
  {
    grade: 5,
    order: 3,
    areaId: "g5-shield",
    areaName: "Lá chắn an toàn",
    areaIcon: "🛡️",
    stationTitle: "Khoảng cách cứu nguy",
    sourceLessonTitle:
      "Bài 10 – Phòng tránh tai nạn giao thông đường bộ",
    sourceSections: [
      "10.1 Tốc độ, thời gian và khoảng cách dừng xe",
    ],
  },
  {
    grade: 5,
    order: 4,
    areaId: "g5-shield",
    areaName: "Lá chắn an toàn",
    areaIcon: "🛡️",
    stationTitle: "Mắt tinh dự đoán nguy hiểm",
    sourceLessonTitle:
      "Bài 10 – Phòng tránh tai nạn giao thông đường bộ",
    sourceSections: [
      "10.2 Phòng tránh các tình huống giao thông nguy hiểm",
    ],
  },
  {
    grade: 5,
    order: 5,
    areaId: "g5-shield",
    areaName: "Lá chắn an toàn",
    areaIcon: "🛡️",
    stationTitle: "Ứng biến an toàn",
    sourceLessonTitle:
      "Bài 10 – Phòng tránh tai nạn giao thông đường bộ",
    sourceSections: [
      "10.3 Phòng tránh một số tình huống nguy hiểm khác",
    ],
  },
];

export function getStudentStations(grade: Grade) {
  return STUDENT_STATIONS
    .filter((item) => item.grade === grade)
    .sort((a, b) => a.order - b.order);
}
