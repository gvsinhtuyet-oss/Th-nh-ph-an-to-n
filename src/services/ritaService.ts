import { VerifiedKnowledgeChunk } from '../types';
import { idbGetAll, STORES } from '../db/indexedDb';

export interface RitaQueryOptions {
  message: string;
  mode?: string;
  grade: number;
  journeyTitle?: string;
  stageTitle?: string;
  activityPrompt?: string;
  activityCompleted: boolean;
  attemptCount: number;
  questionContext?: string;
  ritaOfflineHint?: string;
}

export async function askRita(options: RitaQueryOptions): Promise<{ reply: string; isOffline: boolean }> {
  // Check browser network status first
  if (!navigator.onLine) {
    return {
      reply: getOfflineFallbackResponse(options),
      isOffline: true,
    };
  }

  try {
    // Get verified knowledge chunks from local DB
    const allChunks = await idbGetAll<VerifiedKnowledgeChunk>(STORES.VERIFIED_KNOWLEDGE);
    const verifiedKnowledge = allChunks.filter(c => c.verified && c.allowedForRita);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch('/api/rita', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: options.message,
        mode: options.mode || 'hint',
        grade: options.grade,
        journeyTitle: options.journeyTitle,
        stageTitle: options.stageTitle,
        activityPrompt: options.activityPrompt,
        activityCompleted: options.activityCompleted,
        attemptCount: options.attemptCount,
        questionContext: options.questionContext,
        verifiedKnowledge,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || getOfflineFallbackResponse(options),
      isOffline: data.isOfflineFallback || false,
    };
  } catch (err) {
    return {
      reply: getOfflineFallbackResponse(options),
      isOffline: true,
    };
  }
}

function getOfflineFallbackResponse(options: RitaQueryOptions): string {
  if (options.ritaOfflineHint) {
    return `[Gợi ý ngoại tuyến từ thầy cô]: ${options.ritaOfflineHint}`;
  }

  if (!options.activityCompleted) {
    if (options.attemptCount > 0) {
      return "Hiện mình đang ở chế độ ngoại tuyến. Đừng nản lòng nhé! Bạn hãy đọc thật kỹ từng lựa chọn và nhớ lại kiến thức vừa học ở phần Lý thuyết xem sao!";
    }
    return "Hiện mình đang ở chế độ ngoại tuyến. Mình gợi ý bạn quan sát kỹ hình ảnh, các biển báo hoặc vị trí của người đi bộ trong câu hỏi nhé!";
  }

  return "Hiện mình đang ở chế độ ngoại tuyến. Bạn đã hoàn thành câu hỏi này rất xuất sắc rồi đó! Cùng mình bước tiếp sang thử thách tiếp theo nhé.";
}
