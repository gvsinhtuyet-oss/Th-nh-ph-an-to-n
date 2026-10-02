import { Reward, KnowledgeCard, CertificateData, StudentProfile } from '../types';
import { idbGet, idbGetAll, idbPut, STORES } from '../db/indexedDb';

export async function getInventory(): Promise<Reward[]> {
  return idbGetAll<Reward>(STORES.INVENTORY);
}

export async function addInventoryItem(reward: Reward): Promise<boolean> {
  if (!reward || !reward.id) return false;
  const existing = await idbGet<Reward>(STORES.INVENTORY, reward.id);
  if (existing) {
    return false; // Already claimed, no duplicate
  }

  const newItem: Reward = {
    ...reward,
    unlockedAt: new Date().toISOString(),
  };

  await idbPut<Reward>(STORES.INVENTORY, newItem);
  return true;
}

export async function getKnowledgeCards(): Promise<KnowledgeCard[]> {
  const cards = await idbGetAll<KnowledgeCard>(STORES.KNOWLEDGE_NOTEBOOK);
  return cards.sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
}

export async function addKnowledgeCard(card: KnowledgeCard): Promise<boolean> {
  if (!card || !card.id) return false;
  const existing = await idbGet<KnowledgeCard>(STORES.KNOWLEDGE_NOTEBOOK, card.id);
  if (existing) {
    return false;
  }

  await idbPut<KnowledgeCard>(STORES.KNOWLEDGE_NOTEBOOK, card);
  return true;
}

export async function getCertificate(journeyId: string): Promise<CertificateData | null> {
  return idbGet<CertificateData>(STORES.CERTIFICATES, journeyId);
}

export async function createOrGetCertificate(
  journeyId: string,
  journeyTitle: string,
  grade: any,
  score: number,
  maxScore: number,
  finalBadge: { name: string; icon: string },
  nickname: string
): Promise<CertificateData> {
  const existing = await idbGet<CertificateData>(STORES.CERTIFICATES, journeyId);
  if (existing) {
    return existing; // Certificate code is created once and NEVER changes
  }

  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certificateCode = `TPAT-K${grade}-${journeyId.toUpperCase()}-${randomSuffix}`;

  const certData: CertificateData = {
    certificateCode,
    nickname,
    grade,
    journeyId,
    journeyTitle,
    score,
    maxScore: maxScore || 100,
    finalBadge,
    completionDate: new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
  };

  await idbPut<CertificateData>(STORES.CERTIFICATES, certData);
  return certData;
}
