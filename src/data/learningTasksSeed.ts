import { LearningTask, Mission, MissionStop } from '../types';
import { buildDefaultMissions } from './missionsSeed';

export const CURRICULUM_VERSION = '10-mission-24-station-2026.2';

export const MISSIONS_LIST: Array<{
  id: string;
  order: number;
  title: string;
  gameTitle: string;
  icon: string;
  districtId: string;
  districtName: string;
  description: string;
}> = [
  {
    id: 'm1',
    order: 1,
    title: 'Đường em tới trường',
    gameTitle: 'Con đường an toàn đến trường',
    icon: '🏫',
    districtId: 'school-zone',
    districtName: 'Khu trường học',
    description: 'Tìm hiểu con đường đến trường, đèn tín hiệu, vạch qua đường và phương tiện giao thông.',
  },
  {
    id: 'm2',
    order: 2,
    title: 'Đi bộ và qua đường an toàn',
    gameTitle: 'Bước chân thông thái',
    icon: '🚶',
    districtId: 'center-crossroad',
    districtName: 'Khu trung tâm',
    description: 'Kỹ năng đi bộ trên đường an toàn, qua đường và nơi giao cắt với đường sắt.',
  },
  {
    id: 'm3',
    order: 3,
    title: 'Đi xe đạp an toàn',
    gameTitle: 'Tay lái cừ khôi',
    icon: '🚲',
    districtId: 'sport-park',
    districtName: 'Công viên thể thao',
    description: 'Ngồi sau xe đạp, chọn xe đạp an toàn, điều khiển xe đạp và qua đường an toàn.',
  },
  {
    id: 'm4',
    order: 4,
    title: 'Ngồi sau xe máy an toàn',
    gameTitle: 'Chiến binh mũ bảo hiểm',
    icon: '🛵',
    districtId: 'helmet-station',
    districtName: 'Trạm bảo hộ',
    description: 'Đội mũ bảo hiểm đúng quy cách và kỹ năng ngồi sau xe máy an toàn.',
  },
  {
    id: 'm5',
    order: 5,
    title: 'Ngồi an toàn trong xe ô tô',
    gameTitle: 'Hành khách nhí văn minh',
    icon: '🚗',
    districtId: 'auto-hub',
    districtName: 'Đại lộ trung tâm',
    description: 'Sử dụng dây đai an toàn và các quy tắc khi ngồi trong xe ô tô.',
  },
  {
    id: 'm6',
    order: 6,
    title: 'An toàn khi đi xe buýt, tàu hỏa',
    gameTitle: 'Chuyến xe tương lai',
    icon: '🚌',
    districtId: 'bus-station',
    districtName: 'Bến xe trung tâm',
    description: 'Hành khách an toàn và văn minh trên xe buýt và tàu hỏa.',
  },
  {
    id: 'm7',
    order: 7,
    title: 'An toàn khi đi trên phương tiện giao thông đường thủy',
    gameTitle: 'Thủy thủ sông nước',
    icon: '⛴️',
    districtId: 'river-port',
    districtName: 'Bến cảng sông nước',
    description: 'Cách mặc áo phao cứu sinh, dụng cụ nổi và an toàn khi đi thuyền, đò, phà.',
  },
  {
    id: 'm8',
    order: 8,
    title: 'Biển báo hiệu giao thông đường bộ',
    gameTitle: 'Giải mã biển báo',
    icon: '🛑',
    districtId: 'sign-plaza',
    districtName: 'Quảng trường biển báo',
    description: 'Nhận diện các nhóm biển báo hiệu giao thông và ý nghĩa các biển báo cơ bản.',
  },
  {
    id: 'm9',
    order: 9,
    title: 'Hậu quả của tai nạn giao thông đường bộ',
    gameTitle: 'Thành phố bình yên',
    icon: '⚠️',
    districtId: 'safety-center',
    districtName: 'Trung tâm an toàn thành phố',
    description: 'Nhận biết tai nạn giao thông và thấu hiểu hậu quả của tai nạn giao thông đường bộ.',
  },
  {
    id: 'm10',
    order: 10,
    title: 'Phòng tránh tai nạn giao thông đường bộ',
    gameTitle: 'Vệ binh an toàn giao thông',
    icon: '🛡️',
    districtId: 'safety-center',
    districtName: 'Trung tâm an toàn thành phố',
    description: 'Nhận diện nguy cơ, tốc độ, khoảng cách dừng xe và phòng tránh tình huống nguy hiểm.',
  },
];

// 24 NHIỆM VỤ HỌC TẬP (LEARNING TASKS)
export const RAW_LEARNING_TASKS: LearningTask[] = [
  // =========================================================================
  // CẤP 1 — 5 NHIỆM VỤ
  // =========================================================================
  // CHẶNG 1 – Đường em tới trường
  {
    id: 'task-g1-1',
    missionId: 'm1',
    grade: 1,
    orderInGrade: 1,
    orderInMission: 1,
    title: 'Con đường quen thuộc',
    sourceSections: [
      '1.1 Tìm hiểu về đường đến trường',
      '1.2 Đèn tín hiệu giao thông',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🛣️',
  },
  {
    id: 'task-g1-2',
    missionId: 'm1',
    grade: 1,
    orderInGrade: 2,
    orderInMission: 2,
    title: 'Mật mã giao thông quanh em',
    sourceSections: [
      'Người điều khiển giao thông',
      '1.3 Vạch đi bộ qua đường',
      '1.4 Các loại phương tiện giao thông',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '👮',
  },
  // CHẶNG 3 – Đi xe đạp an toàn
  {
    id: 'task-g1-3',
    missionId: 'm3',
    grade: 1,
    orderInGrade: 3,
    orderInMission: 1,
    title: 'Bạn nhỏ ngồi xe đạp',
    sourceSections: [
      '3.1 Ngồi sau xe đạp an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚲',
  },
  // CHẶNG 4 – Ngồi sau xe máy an toàn
  {
    id: 'task-g1-4',
    missionId: 'm4',
    grade: 1,
    orderInGrade: 4,
    orderInMission: 1,
    title: 'Chiếc mũ bảo vệ em',
    sourceSections: [
      'Đội mũ bảo hiểm và cài quai đúng quy cách',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🪖',
  },
  {
    id: 'task-g1-5',
    missionId: 'm4',
    grade: 1,
    orderInGrade: 5,
    orderInMission: 2,
    title: 'Ngồi xe máy thật an toàn',
    sourceSections: [
      'Ngồi sau xe máy an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🛵',
  },

  // =========================================================================
  // CẤP 2 — 5 NHIỆM VỤ
  // =========================================================================
  // CHẶNG 2 – Đi bộ và qua đường an toàn
  {
    id: 'task-g2-1',
    missionId: 'm2',
    grade: 2,
    orderInGrade: 1,
    orderInMission: 1,
    title: 'Bước chân đúng đường',
    sourceSections: [
      '2.1 Đi bộ trên đường an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '👟',
  },
  {
    id: 'task-g2-2',
    missionId: 'm2',
    grade: 2,
    orderInGrade: 2,
    orderInMission: 2,
    title: 'Thử thách đường sắt',
    sourceSections: [
      '2.2 Đi bộ ở nơi đường bộ giao với đường sắt',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚂',
  },
  {
    id: 'task-g2-3',
    missionId: 'm2',
    grade: 2,
    orderInGrade: 3,
    orderInMission: 3,
    title: 'Qua đường thông minh',
    sourceSections: [
      '2.3 Đi bộ qua đường an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚸',
  },
  // CHẶNG 5 – Ngồi an toàn trong xe ô tô
  {
    id: 'task-g2-4',
    missionId: 'm5',
    grade: 2,
    orderInGrade: 4,
    orderInMission: 1,
    title: 'Chiếc đai bảo vệ',
    sourceSections: [
      '5.1 Sử dụng dây đai an toàn dành cho xe ô tô',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🪢',
  },
  {
    id: 'task-g2-5',
    missionId: 'm5',
    grade: 2,
    orderInGrade: 5,
    orderInMission: 2,
    title: 'Hành khách nhí an toàn',
    sourceSections: [
      '5.2 Ngồi an toàn trong xe ô tô',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚗',
  },

  // =========================================================================
  // CẤP 3 — 5 NHIỆM VỤ
  // =========================================================================
  // CHẶNG 3 – Đi xe đạp an toàn
  {
    id: 'task-g3-1',
    missionId: 'm3',
    grade: 3,
    orderInGrade: 1,
    orderInMission: 2,
    title: 'Chọn xe đúng chuẩn',
    sourceSections: [
      '3.2 Chọn xe an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🔧',
  },
  {
    id: 'task-g3-2',
    missionId: 'm3',
    grade: 3,
    orderInGrade: 2,
    orderInMission: 3,
    title: 'Tay lái an toàn',
    sourceSections: [
      '3.3 Điều khiển xe đạp an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚲',
  },
  {
    id: 'task-g3-3',
    missionId: 'm3',
    grade: 3,
    orderInGrade: 3,
    orderInMission: 4,
    title: 'Qua đường thông minh',
    sourceSections: [
      '3.4 Điều khiển xe đạp qua đường an toàn',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🛣️',
  },
  // CHẶNG 6 – An toàn khi đi xe buýt, tàu hỏa
  {
    id: 'task-g3-4',
    missionId: 'm6',
    grade: 3,
    orderInGrade: 4,
    orderInMission: 1,
    title: 'Hành khách xe buýt văn minh',
    sourceSections: [
      '6.1 An toàn khi đi xe buýt',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚍',
  },
  {
    id: 'task-g3-5',
    missionId: 'm6',
    grade: 3,
    orderInGrade: 5,
    orderInMission: 2,
    title: 'Chuyến tàu an toàn',
    sourceSections: [
      '6.2 An toàn khi đi tàu hỏa',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚆',
  },

  // =========================================================================
  // CẤP 4 — 4 NHIỆM VỤ
  // =========================================================================
  // CHẶNG 7 – An toàn khi đi trên phương tiện giao thông đường thủy
  {
    id: 'task-g4-1',
    missionId: 'm7',
    grade: 4,
    orderInGrade: 1,
    orderInMission: 1,
    title: 'Lá chắn áo phao',
    sourceSections: [
      '7.1 Cách mặc áo phao cứu sinh, sử dụng dụng cụ nổi cứu sinh cá nhân',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🦺',
  },
  {
    id: 'task-g4-2',
    missionId: 'm7',
    grade: 4,
    orderInGrade: 2,
    orderInMission: 2,
    title: 'Vượt sóng an toàn',
    sourceSections: [
      '7.2 An toàn khi đi trên thuyền, đò, phà',
      '7.3 Một số hành vi nguy hiểm khi đi thuyền, đò, phà',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '⛵',
  },
  // CHẶNG 8 – Biển báo hiệu giao thông đường bộ
  {
    id: 'task-g4-3',
    missionId: 'm8',
    grade: 4,
    orderInGrade: 3,
    orderInMission: 1,
    title: 'Giải mã nhóm biển báo',
    sourceSections: [
      '8.1 Các nhóm biển báo hiệu giao thông đường bộ',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🛑',
  },
  {
    id: 'task-g4-4',
    missionId: 'm8',
    grade: 4,
    orderInGrade: 4,
    orderInMission: 2,
    title: 'Thám tử biển báo',
    sourceSections: [
      '8.2 Một số biển báo hiệu cơ bản',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🔍',
  },

  // =========================================================================
  // CẤP 5 — 5 NHIỆM VỤ
  // =========================================================================
  // CHẶNG 9 – Hậu quả của tai nạn giao thông đường bộ
  {
    id: 'task-g5-1',
    missionId: 'm9',
    grade: 5,
    orderInGrade: 1,
    orderInMission: 1,
    title: 'Đi tìm nguyên nhân',
    sourceSections: [
      '9.1 Tìm hiểu về tai nạn giao thông đường bộ',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚨',
  },
  {
    id: 'task-g5-2',
    missionId: 'm9',
    grade: 5,
    orderInGrade: 2,
    orderInMission: 2,
    title: 'Một giây bất cẩn',
    sourceSections: [
      '9.2 Hậu quả của tai nạn giao thông đường bộ',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '💔',
  },
  // CHẶNG 10 – Phòng tránh tai nạn giao thông đường bộ
  {
    id: 'task-g5-3',
    missionId: 'm10',
    grade: 5,
    orderInGrade: 3,
    orderInMission: 1,
    title: 'Khoảng cách cứu nguy',
    sourceSections: [
      '10.1 Tốc độ, thời gian và khoảng cách dừng xe',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '⏱️',
  },
  {
    id: 'task-g5-4',
    missionId: 'm10',
    grade: 5,
    orderInGrade: 4,
    orderInMission: 2,
    title: 'Mắt tinh dự đoán nguy hiểm',
    sourceSections: [
      '10.2 Phòng tránh các tình huống giao thông nguy hiểm',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '⚠️',
  },
  {
    id: 'task-g5-5',
    missionId: 'm10',
    grade: 5,
    orderInGrade: 5,
    orderInMission: 3,
    title: 'Ứng biến an toàn',
    sourceSections: [
      '10.3 Phòng tránh một số tình huống nguy hiểm khác',
    ],
    sourceRecommended: true,
    teacherAdded: false,
    sourcePeriodCount: 1,
    status: 'published',
    version: '2026.1',
    icon: '🚑',
  },
];

export function buildDefaultLearningTasks(): LearningTask[] {
  const missions = buildDefaultMissions();
  const stopMap = new Map<string, MissionStop>();
  for (const m of missions) {
    if (m.stops) {
      for (const s of m.stops) {
        stopMap.set(s.id, s);
      }
    }
  }

  return RAW_LEARNING_TASKS.map((task) => {
    let matchedStop: MissionStop | undefined;
    if (task.id === 'task-g1-1') matchedStop = stopMap.get('m1-s1') || stopMap.get('m1-s2');
    else if (task.id === 'task-g1-2') matchedStop = stopMap.get('m1-s3') || stopMap.get('m1-s2b') || stopMap.get('m1-s4');
    else if (task.id === 'task-g1-3') matchedStop = stopMap.get('m3-s1');
    else if (task.id === 'task-g1-4') matchedStop = stopMap.get('m4-s1');
    else if (task.id === 'task-g1-5') matchedStop = stopMap.get('m4-s2');

    else if (task.id === 'task-g2-1') matchedStop = stopMap.get('m2-s1');
    else if (task.id === 'task-g2-2') matchedStop = stopMap.get('m2-s2');
    else if (task.id === 'task-g2-3') matchedStop = stopMap.get('m2-s3');
    else if (task.id === 'task-g2-4') matchedStop = stopMap.get('m5-s1');
    else if (task.id === 'task-g2-5') matchedStop = stopMap.get('m5-s2');

    else if (task.id === 'task-g3-1') matchedStop = stopMap.get('m3-s2');
    else if (task.id === 'task-g3-2') matchedStop = stopMap.get('m3-s3');
    else if (task.id === 'task-g3-3') matchedStop = stopMap.get('m3-s4');
    else if (task.id === 'task-g3-4') matchedStop = stopMap.get('m6-s1');
    else if (task.id === 'task-g3-5') matchedStop = stopMap.get('m6-s2');

    else if (task.id === 'task-g4-1') matchedStop = stopMap.get('m7-s1');
    else if (task.id === 'task-g4-2') matchedStop = stopMap.get('m7-s2');
    else if (task.id === 'task-g4-3') matchedStop = stopMap.get('m8-s1');
    else if (task.id === 'task-g4-4') matchedStop = stopMap.get('m8-s2');

    else if (task.id === 'task-g5-1') matchedStop = stopMap.get('m9-s1');
    else if (task.id === 'task-g5-2') matchedStop = stopMap.get('m9-s2');
    else if (task.id === 'task-g5-3') matchedStop = stopMap.get('m10-s1');
    else if (task.id === 'task-g5-4') matchedStop = stopMap.get('m10-s2');
    else if (task.id === 'task-g5-5') matchedStop = stopMap.get('m10-s3');

    if (matchedStop) {
      return {
        ...task,
        icon: task.icon || matchedStop.icon,
        intro: matchedStop.intro,
        theory: matchedStop.theory,
        activities: matchedStop.activities,
        keyTakeaway: matchedStop.keyTakeaway,
        reward: {
          ...matchedStop.reward,
          id: `rw-${task.id}`,
          stageId: task.id,
          journeyId: task.missionId,
        },
      };
    }
    return task;
  });
}

export function buildDefaultMissionsWithTasks(): Mission[] {
  const missionsWithStops = buildDefaultMissions();
  return MISSIONS_LIST.map((m) => {
    const tasks = RAW_LEARNING_TASKS.filter((t) => t.missionId === m.id).sort(
      (a, b) => a.orderInMission - b.orderInMission
    );
    const originalMission = missionsWithStops.find((item) => item.id === m.id);

    return {
      id: m.id,
      order: m.order,
      missionNumber: m.order,
      title: m.title,
      gameTitle: m.gameTitle,
      icon: m.icon,
      districtId: m.districtId,
      districtName: m.districtName,
      description: m.description,
      learningTaskIds: tasks.map((t) => t.id),
      stops: originalMission?.stops || [], // Preserves old 27 stops as archived source nodes
      status: 'published',
      curriculumVersion: CURRICULUM_VERSION,
      maxScore: tasks.length * 30,
      finalBadge: {
        name: `Huy Hiệu ${m.title}`,
        icon: m.icon,
        description: `Hoàn thành xuất sắc chuyên đề ${m.title}`,
      },
    };
  });
}
