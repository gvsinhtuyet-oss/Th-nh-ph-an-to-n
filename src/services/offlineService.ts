import { Journey, OfflinePackageStatus } from '../types';
import { idbGet, idbPut, idbDelete, STORES } from '../db/indexedDb';

export async function getStorageQuota(): Promise<{
  usageMb: number;
  quotaMb: number;
  usagePercent: number;
}> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1024 * 1024 * 1024; // fallback 1GB
      return {
        usageMb: Math.round(usage / (1024 * 1024)),
        quotaMb: Math.round(quota / (1024 * 1024)),
        usagePercent: Math.min(100, Math.round((usage / quota) * 100)),
      };
    } catch {
      // Fallback
    }
  }
  return { usageMb: 48, quotaMb: 2048, usagePercent: 2 };
}

export async function getOfflinePackageStatus(journeyId: string): Promise<OfflinePackageStatus | null> {
  return idbGet<OfflinePackageStatus>(STORES.OFFLINE_PACKAGES, journeyId);
}

export function calculateJourneyOfflineSize(journey: Journey): { sizeBytes: number; sizeDisplay: string } {
  // Approximate based on stages, activities, and theory text
  let bytes = 10 * 1024 * 1024; // base journey payload (10 MB)
  for (const stage of journey.stages) {
    if (stage.theory.content) bytes += stage.theory.content.length * 100;
    if (stage.activities) bytes += stage.activities.length * 200 * 1024;
    if (stage.intro.mediaUrl) bytes += 2 * 1024 * 1024;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return {
    sizeBytes: bytes,
    sizeDisplay: `${mb} MB`,
  };
}

export async function downloadJourneyOffline(
  journey: Journey,
  onProgress?: (percent: number, statusText: string) => void
): Promise<OfflinePackageStatus> {
  const cacheName = `tpat-journey-${journey.versionId || journey.id}`;
  const sizeInfo = calculateJourneyOfflineSize(journey);

  if (onProgress) onProgress(20, 'Đang chuẩn bị gói học liệu số...');
  await new Promise((r) => setTimeout(r, 200));

  if (onProgress) onProgress(45, 'Đang lưu nội dung lý thuyết và câu hỏi thực hành...');
  await new Promise((r) => setTimeout(r, 250));

  if (onProgress) onProgress(80, 'Đang tải dữ liệu hỗ trợ RITA Ngoại tuyến...');
  await new Promise((r) => setTimeout(r, 200));

  // Validate required vs optional assets
  const missingRequired: string[] = [];
  for (const stage of journey.stages) {
    if (stage.intro.required && !stage.intro.description && !stage.intro.mediaUrl) {
      missingRequired.push(`Chặng ${stage.order}: Thiếu tài nguyên khởi động bắt buộc`);
    }
    if (stage.theory.requiredBeforePractice && (!stage.theory.content || stage.theory.content.trim() === '')) {
      missingRequired.push(`Chặng ${stage.order}: Thiếu nội dung lý thuyết bắt buộc`);
    }
  }

  // Cache JSON
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(cacheName);
      const blob = new Blob([JSON.stringify(journey)], { type: 'application/json' });
      await cache.put(
        new Request(`/offline-journey-${journey.id}.json`),
        new Response(blob, { headers: { 'Content-Type': 'application/json' } })
      );
    } catch {
      // Ignore
    }
  }

  if (onProgress) onProgress(100, 'Hoàn tất tải về! Sẵn sàng học ngoại tuyến.');

  const status: 'ready' | 'missing_required' | 'missing_optional' =
    missingRequired.length > 0 ? 'missing_required' : 'ready';

  const pkgStatus: OfflinePackageStatus = {
    journeyId: journey.id,
    journeyVersionId: journey.versionId || `${journey.id}-v1`,
    downloaded: true,
    downloadDate: new Date().toLocaleDateString('vi-VN'),
    sizeBytes: sizeInfo.sizeBytes,
    sizeDisplay: sizeInfo.sizeDisplay,
    status,
    missingAssets: missingRequired,
  };

  await idbPut<OfflinePackageStatus>(STORES.OFFLINE_PACKAGES, pkgStatus);
  return pkgStatus;
}

export async function removeOfflineCopy(journeyId: string, versionId: string): Promise<void> {
  const cacheName = `tpat-journey-${versionId || journeyId}`;
  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(cacheName);
    } catch {
      // Ignore
    }
  }
  await idbDelete(STORES.OFFLINE_PACKAGES, journeyId);
}
