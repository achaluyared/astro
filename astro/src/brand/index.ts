import { massageBrand } from './massage';
import { vipBrand } from './vip';
import type { BrandConfig, BrandId } from './types';

function brandIdFromEnv(): BrandId {
  const raw = (import.meta.env.BRAND ?? 'massage').toLowerCase();
  return raw === 'vip' ? 'vip' : 'massage';
}

export const brand: BrandConfig = brandIdFromEnv() === 'vip' ? vipBrand : massageBrand;
