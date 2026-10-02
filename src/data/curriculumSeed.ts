import { Journey, Stage, Activity } from '../types';
import { LESSON_BLUEPRINTS, LessonBlueprint } from './lessonBlueprints';

export const SEED_VERSION = '2026.2';

function createBaseStage(
  journeyId: string,
  order: number,
  title: string,
  icon: string,
  rewardName: string,
  rewardIcon: string,
  isFinal: boolean = false
): Stage {
  return {
    id: `${journeyId}-s${order}`,
    journeyId,
    order,
    title,
    icon,
    intro: {
      type: order === 1 ? 'song' : 'animation',
      title: `Khởi động chặng ${order}: ${title}`,
      description: 'Cùng RITA lắng nghe giai điệu và quan sát tình huống giao thông',
      required: false,
    },
    theory: {
      title: `Kiến thức: ${title}`,
      content: '',
      sourceIds: [],
      verified: false,
      requiredBeforePractice: false,
      allowedForRita: false,
    },
    activities: [],
    keyTakeaway: `Hãy luôn ghi nhớ quy tắc an toàn ở chặng: ${title}.`,
    reward: {
      id: `rw-${journeyId}-s${order}`,
      name: rewardName,
      type: order === 7 ? 'badge' : order % 2 === 1 ? 'item' : 'knowledge_card',
      icon: rewardIcon,
      description: `Phần thưởng đạt được khi xuất sắc vượt qua ${title}.`,
      journeyId,
      stageId: `${journeyId}-s${order}`,
    },
    isFinalStage: isFinal,
    summary: isFinal
      ? {
          title: `Tổng kết: ${title}`,
          content: 'Em đã xuất sắc hoàn thành tất cả 7 chặng thử thách của bài học!',
          realLifeTask: 'Cùng gia đình quan sát thực tế khi đi trên đường mỗi ngày.',
        }
      : undefined,
  };
}

// Concrete interactive sample for g2-l2 (Grade 2, Lesson 2: Đi bộ qua đường an toàn)
// to satisfy prompt test flow: Lớp 2 -> Đi bộ qua đường an toàn
function createG2L2SampleStages(journeyId: string): Stage[] {
  const stages = [
    {
      order: 1,
      title: 'Hát cùng RITA',
      icon: '🎵',
      introType: 'song' as const,
      introDesc: 'RITA cùng bé khởi động bài hát vạch kẻ đường an toàn (15 giây)',
      theory: 'Khi đi bộ trên đường, các bạn nhỏ phải luôn đi trên vỉa hè hoặc lề đường bên phải. Khi muốn qua đường, tuyệt đối không chạy vụt mà phải tìm nơi có vạch kẻ đường dành cho người đi bộ.',
      takeaway: 'Luôn đi trên vỉa hè và tìm vạch kẻ đường khi muốn sang đường!',
      rwName: 'Huy hiệu Bước Chân Vui',
      rwIcon: '👟',
      rwType: 'item' as const,
      activities: [
        {
          id: `${journeyId}-s1-a1`,
          stageId: `${journeyId}-s1`,
          type: 'single_choice' as const,
          difficulty: 'basic' as const,
          prompt: 'Khi muốn chuẩn bị qua đường, bước đầu tiên em nên làm gì?',
          options: [
            { id: 'opt-1', label: 'Chạy thật nhanh sang đường' },
            { id: 'opt-2', label: 'Dừng lại trên vỉa hè, quan sát hai phía đường', isCorrect: true },
            { id: 'opt-3', label: 'Vừa đi vừa đùa nghịch cùng bạn' }
          ],
          correctAnswer: 'opt-2',
          score: 10,
          feedbackCorrect: 'Tuyệt vời! Dừng lại trên vỉa hè quan sát cẩn thận là hành động đúng đắn nhất.',
          feedbackWrong: 'Chưa đúng rồi! Chạy nhanh hoặc đùa nghịch trên đường rất nguy hiểm.',
          ritaHint: 'Bạn hãy nghĩ xem nếu chạy vội thì các chú lái xe có kịp nhìn thấy mình không nhé.',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 2,
      title: 'Em đi bộ an toàn',
      icon: '🚶',
      introType: 'animation' as const,
      introDesc: 'Mô phỏng bước chân an toàn trên vỉa hè cùng RITA',
      theory: 'Đi bộ an toàn đòi hỏi bạn phải nắm tay người lớn nếu dưới 7 tuổi. Luôn tập trung, không dùng điện thoại hay đá bóng trên lòng đường. Mắt luôn quan sát các phương tiện đi tới.',
      takeaway: 'Mắt nhìn thẳng, tai lắng nghe còi xe, tuyệt đối không đùa giỡn dưới lòng đường.',
      rwName: 'Thẻ Ghi Nhớ Vỉa Hè Vàng',
      rwIcon: '🚸',
      rwType: 'knowledge_card' as const,
      activities: [
        {
          id: `${journeyId}-s2-a1`,
          stageId: `${journeyId}-s2`,
          type: 'single_choice' as const,
          difficulty: 'basic' as const,
          prompt: 'Nơi nào là an toàn nhất để em đi bộ trên phố?',
          options: [
            { id: 'opt-1', label: 'Lòng đường xe chạy' },
            { id: 'opt-2', label: 'Vỉa hè hoặc sát lề đường bên phải', isCorrect: true },
            { id: 'opt-3', label: 'Đi bộ giữa dải phân cách' }
          ],
          correctAnswer: 'opt-2',
          score: 10,
          feedbackCorrect: 'Chính xác! Vỉa hè và lề đường bên phải là làn dành riêng bảo vệ người đi bộ.',
          feedbackWrong: 'Đi ở lòng đường hay dải phân cách rất nguy hiểm vì xe cộ chạy liên tục.',
          ritaHint: 'Vỉa hè lát gạch cao hơn mặt đường dành cho ai đi bộ nhỉ?',
          verified: true,
          required: true
        },
        {
          id: `${journeyId}-s2-a2`,
          stageId: `${journeyId}-s2`,
          type: 'multiple_choice' as const,
          difficulty: 'applied' as const,
          prompt: 'Những hành động nào sau đây là KHÔNG AN TOÀN khi đi bộ? (Chọn các câu đúng)',
          options: [
            { id: 'opt-a', label: 'Vừa đi vừa đá bóng dưới lòng đường', isCorrect: true },
            { id: 'opt-b', label: 'Đi sát lề đường bên phải' },
            { id: 'opt-c', label: 'Đeo tai nghe bật nhạc thật to khi qua đường', isCorrect: true }
          ],
          correctAnswer: ['opt-a', 'opt-c'],
          score: 15,
          feedbackCorrect: 'Đúng rồi! Đá bóng dưới lòng đường và đeo tai nghe to làm mất tập trung nguy hiểm.',
          feedbackWrong: 'Hãy quan sát kỹ các hành động gây mất tập trung trên đường nhé.',
          ritaHint: 'Tai phải nghe tiếng còi xe, mắt phải quan sát xe cộ bạn nhé.',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 3,
      title: 'Chọn nơi qua đường',
      icon: '🦓',
      introType: 'image' as const,
      introDesc: 'Hình ảnh nhận biết vạch ngựa vằn, cầu vượt bộ hành và hầm chui',
      theory: 'Nơi qua đường an toàn nhất là: 1. Nơi có vạch kẻ đường hình ngựa vằn; 2. Cầu vượt dành cho người đi bộ; 3. Hầm chui bộ hành. Nếu không có vạch kẻ, phải chọn đoạn đường thẳng tầm nhìn thông thoáng.',
      takeaway: 'Chỉ qua đường tại vạch kẻ ngựa vằn, cầu vượt hoặc hầm bộ hành!',
      rwName: 'Ống Kính Thám Tử Đường Phố',
      rwIcon: '🔍',
      rwType: 'item' as const,
      activities: [
        {
          id: `${journeyId}-s3-a1`,
          stageId: `${journeyId}-s3`,
          type: 'single_choice' as const,
          difficulty: 'basic' as const,
          prompt: 'Khi muốn sang bên kia đường lớn có nhiều xe tải, em nên chọn lối đi nào?',
          options: [
            { id: 'opt-1', label: 'Leo qua dải phân cách giữa đường' },
            { id: 'opt-2', label: 'Đi lên cầu vượt dành riêng cho người đi bộ', isCorrect: true },
            { id: 'opt-3', label: 'Luồn lách qua các đuôi xe tải' }
          ],
          correctAnswer: 'opt-2',
          score: 10,
          feedbackCorrect: 'Xuất sắc! Cầu vượt bộ hành giúp em qua đường mà không phải chạm vào dòng xe cộ.',
          feedbackWrong: 'Trèo dải phân cách hay luồn đuôi xe tải cực kỳ nguy hiểm vì điểm mù tài xế.',
          ritaHint: 'Có một lối đi trên cao giúp chúng mình băng qua đường mà không sợ xe cộ đụng phải nè!',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 4,
      title: 'Quan sát trước khi qua',
      icon: '👀',
      introType: 'animation' as const,
      introDesc: 'RITA thực hiện quy tắc 3 bước: Nhìn trái - Nhìn phải - Nhìn lại trái',
      theory: 'Quy tắc 3 bước vàng: 1. Nhìn sang bên trái xem có xe đang đến không; 2. Nhìn sang bên phải quan sát chiều ngược lại; 3. Nhìn lại bên trái một lần nữa trước khi bước xuống vạch kẻ đường. Luôn giơ cao một tay để báo hiệu.',
      takeaway: 'Nhìn trái, nhìn phải, nhìn lại trái - Giơ tay cao xin đường!',
      rwName: 'Bàn Tay Báo Hiệu Phát Sáng',
      rwIcon: '✋',
      rwType: 'item' as const,
      activities: [
        {
          id: `${journeyId}-s4-a1`,
          stageId: `${journeyId}-s4`,
          type: 'sequence' as const,
          difficulty: 'applied' as const,
          prompt: 'Sắp xếp đúng thứ tự 3 bước quan sát an toàn khi chuẩn bị bước sang đường:',
          options: [
            { id: 'step-1', label: '1. Dừng trên vỉa hè, nhìn sang bên TRÁI' },
            { id: 'step-2', label: '2. Nhìn sang bên PHẢI' },
            { id: 'step-3', label: '3. Nhìn lại bên TRÁI một lần nữa rồi giơ tay xin đường' }
          ],
          correctAnswer: ['step-1', 'step-2', 'step-3'],
          score: 15,
          feedbackCorrect: 'Chính xác từng bước! Em đã thành thạo quy tắc vàng quan sát khi qua đường.',
          feedbackWrong: 'Hãy nhớ: Xe chiều gần mình nhất chạy từ bên trái tới trước nhé!',
          ritaHint: 'Chiều xe gần vỉa hè bên em chạy tới từ bên nào trước tiên nào?',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 5,
      title: 'Cẩn thận nơi tầm nhìn bị che',
      icon: '🔎',
      introType: 'story' as const,
      introDesc: 'Câu chuyện chú thỏ con bị chiếc xe buýt che khuất tầm nhìn',
      theory: 'Điểm mù và vật cản: Khi có ô tô đỗ bên đường, bụi cây lớn hoặc xe buýt che khuất, tuyệt đối không được bước nhanh ra ngoài. Hãy dừng lại ở mép vật cản, nghiêng đầu quan sát kỹ hai bên cho đến khi chắc chắn không có xe mới đi tiếp.',
      takeaway: 'Gặp xe to đỗ ven đường: Dừng lại mép xe, nghiêng đầu ngó cẩn thận mới bước qua.',
      rwName: 'Thẻ Bí Quyết Góc Khuất',
      rwIcon: '📖',
      rwType: 'knowledge_card' as const,
      activities: [
        {
          id: `${journeyId}-s5-a1`,
          stageId: `${journeyId}-s5`,
          type: 'single_choice' as const,
          difficulty: 'challenge' as const,
          prompt: 'Khi vừa bước xuống xe buýt và muốn sang đường, em nên làm gì an toàn nhất?',
          options: [
            { id: 'opt-1', label: 'Chạy cắt ngang ngay trước đầu xe buýt' },
            { id: 'opt-2', label: 'Chạy vòng ngay sau đuôi xe buýt' },
            { id: 'opt-3', label: 'Đợi xe buýt rời đi hẳn hoặc đi đến vạch kẻ đường có tầm nhìn thông thoáng', isCorrect: true }
          ],
          correctAnswer: 'opt-3',
          score: 15,
          feedbackCorrect: 'Rất thông thái! Đầu và đuôi xe buýt là vùng điểm mù khổng lồ các xe khác không thấy em.',
          feedbackWrong: 'Chạy sát đầu hoặc đuôi xe buýt là nguyên nhân chính gây tai nạn khuất tầm nhìn.',
          ritaHint: 'Xe buýt rất to và dài, nếu bạn đứng sát nó thì các cô chú lái xe máy khác có nhìn thấy bạn không?',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 6,
      title: 'Thử thách ngã tư',
      icon: '🚦',
      introType: 'movement' as const,
      introDesc: 'Thử thách mô phỏng vượt qua ngã tư đèn đỏ thông minh',
      theory: 'Tại ngã tư có đèn tín hiệu dành cho người đi bộ: Đèn ĐỎ hình người đứng yên = DỪNG LẠI. Đèn XANH hình người bước đi = ĐƯỢC PHÉP QUA ĐƯỜNG nhưng vẫn cần chú ý các xe rẽ phải.',
      takeaway: 'Đèn đỏ dừng lại - Đèn xanh qua đường - Vẫn luôn quan sát xe rẽ!',
      rwName: 'Ngôi Sao An Toàn Giao Lộ',
      rwIcon: '⭐',
      rwType: 'item' as const,
      activities: [
        {
          id: `${journeyId}-s6-a1`,
          stageId: `${journeyId}-s6`,
          type: 'single_choice' as const,
          difficulty: 'applied' as const,
          prompt: 'Tín hiệu đèn người đi bộ chuyển sang màu ĐỎ hình người đứng yên, em đang ở trên vỉa hè thì phải làm gì?',
          options: [
            { id: 'opt-1', label: 'Dừng lại kiên nhẫn chờ trên vỉa hè', isCorrect: true },
            { id: 'opt-2', label: 'Thấy vắng xe nên chạy vội sang' },
            { id: 'opt-3', label: 'Bước xuống lòng đường đứng chờ' }
          ],
          correctAnswer: 'opt-1',
          score: 10,
          feedbackCorrect: 'Đúng rồi! Đèn đỏ người đi bộ là hiệu lệnh cấm qua đường, hãy chờ trên vỉa hè an toàn.',
          feedbackWrong: 'Dù vắng xe hay đứng dưới lòng đường đều rất nguy hiểm khi phương tiện tăng tốc.',
          ritaHint: 'Đèn đỏ là mệnh lệnh dừng lại của thành phố an toàn đó bạn!',
          verified: true,
          required: true
        }
      ]
    },
    {
      order: 7,
      title: 'Khôi phục ngã tư',
      icon: '🏆',
      introType: 'animation' as const,
      introDesc: 'RITA chúc mừng! Cùng nhau thắp sáng đèn xanh an toàn cho toàn ngã tư',
      theory: 'Tổng kết: Em đã nắm vững các kỹ năng vàng để đi bộ qua đường an toàn: Đi trên vỉa hè, tìm vạch ngựa vằn, nhìn trái - nhìn phải - nhìn lại trái, tránh góc khuất và tuân thủ đèn tín hiệu giao thông.',
      takeaway: 'Mỗi bước chân đúng luật là em đang cùng RITA thắp sáng Thành Phố An Toàn!',
      rwName: 'Huy Hiệu Người Đi Bộ Thông Thái',
      rwIcon: '🏅',
      rwType: 'badge' as const,
      activities: [
        {
          id: `${journeyId}-s7-a1`,
          stageId: `${journeyId}-s7`,
          type: 'single_choice' as const,
          difficulty: 'applied' as const,
          prompt: 'Lời cam kết của Người Đi Bộ Thông Thái là gì?',
          options: [
            { id: 'opt-1', label: 'Chỉ đi đúng luật khi có thầy cô hoặc công an nhắc nhở' },
            { id: 'opt-2', label: 'Luôn tự giác quan sát cẩn thận, đi trên vỉa hè và vạch sang đường mọi lúc mọi nơi', isCorrect: true },
            { id: 'opt-3', label: 'Đi bộ theo ý thích của mình' }
          ],
          correctAnswer: 'opt-2',
          score: 15,
          feedbackCorrect: 'Chào mừng em trở thành Người Đi Bộ Thông Thái của Thành Phố An Toàn!',
          feedbackWrong: 'Người đi bộ thông thái luôn tự giác bảo vệ bản thân và mọi người xung quanh.',
          ritaHint: 'Sự an toàn là do chính bản thân chúng mình tự giác thực hiện mỗi ngày nè!',
          verified: true,
          required: true
        }
      ]
    }
  ];

  return stages.map(s => {
    const stage = createBaseStage(journeyId, s.order, s.title, s.icon, s.rwName, s.rwIcon, s.order === 7);
    stage.intro = {
      type: s.introType,
      title: s.title,
      description: s.introDesc,
      required: false,
    };
    stage.theory = {
      title: `Kiến thức: ${s.title}`,
      content: s.theory,
      sourceIds: ['source-atgt-primary-2026'],
      verified: true,
      requiredBeforePractice: true,
      allowedForRita: true,
    };
    stage.keyTakeaway = s.takeaway;
    stage.reward.type = s.rwType;
    stage.activities = (s.activities as any) || [];
    return stage;
  });
}

export function buildDefaultCurriculum(): Journey[] {
  return LESSON_BLUEPRINTS.map((bp: LessonBlueprint) => {
    let stages: Stage[];

    if (bp.id === 'g2-l2') {
      stages = createG2L2SampleStages(bp.id);
    } else {
      stages = bp.stages.map((stg) =>
        createBaseStage(
          bp.id,
          stg.order,
          stg.title,
          stg.icon,
          stg.rewardName,
          stg.rewardIcon,
          stg.order === 7
        )
      );
    }

    let maxScore = 0;
    stages.forEach((s) => {
      s.activities.forEach((a) => {
        if (a.score && a.score > 0) maxScore += a.score;
      });
    });

    return {
      id: bp.id,
      grade: bp.grade,
      title: bp.title,
      gameTitle: bp.gameTitle,
      icon: bp.icon,
      districtId: bp.districtId,
      districtName: bp.districtName,
      status: 'draft',
      version: 1,
      versionId: `${bp.id}-v1`,
      finalBadge: bp.finalBadge,
      stages,
      maxScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
