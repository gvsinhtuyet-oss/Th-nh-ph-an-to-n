import { Journey, VerifiedKnowledgeChunk } from '../types';
import { getAllJourneys, getJourneyById, saveJourney } from './curriculumService';
import { idbGetAll, STORES } from '../db/indexedDb';

export const BACKUP_SCHEMA_VERSION = '2026.2';

export interface CurriculumBackupPackage {
  schemaVersion: string;
  exportedAt: string;
  app: string;
  journeys: Journey[];
  verifiedKnowledge?: VerifiedKnowledgeChunk[];
}

export async function exportAllCurriculum(): Promise<string> {
  const journeys = await getAllJourneys();
  const verifiedKnowledge = await idbGetAll<VerifiedKnowledgeChunk>(STORES.VERIFIED_KNOWLEDGE);

  const backupPkg: CurriculumBackupPackage = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'Thành Phố An Toàn',
    journeys,
    verifiedKnowledge,
  };

  return JSON.stringify(backupPkg, null, 2);
}

export async function exportSingleJourney(journeyId: string): Promise<string> {
  const journey = await getJourneyById(journeyId);
  if (!journey) throw new Error('Không tìm thấy bài học');

  const backupPkg: CurriculumBackupPackage = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'Thành Phố An Toàn',
    journeys: [journey],
  };

  return JSON.stringify(backupPkg, null, 2);
}

export async function restoreCurriculumFromJson(
  jsonString: string,
  mode: 'skip_published' | 'import_as_draft' = 'import_as_draft'
): Promise<{ restoredCount: number; errors: string[] }> {
  const errors: string[] = [];
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e: any) {
    throw new Error('Tập tin sao lưu không đúng định dạng JSON.');
  }

  if (!parsed.schemaVersion || !Array.isArray(parsed.journeys)) {
    throw new Error('Tập tin sao lưu không hợp lệ: thiếu schemaVersion hoặc danh sách bài học.');
  }

  let restoredCount = 0;
  for (const journey of parsed.journeys) {
    try {
      const existing = await getJourneyById(journey.id);
      if (existing && existing.status === 'published') {
        if (mode === 'skip_published') {
          continue;
        } else {
          // Import as draft clone
          journey.status = 'draft';
          journey.version = (existing.version || 1) + 1;
          journey.versionId = `${journey.id}-v${journey.version}`;
        }
      }
      await saveJourney(journey);
      restoredCount++;
    } catch (err: any) {
      errors.push(`Lỗi khôi phục bài ${journey.id}: ${err.message}`);
    }
  }

  return { restoredCount, errors };
}
