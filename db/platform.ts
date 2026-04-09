// This file acts as the platform resolver.
// Metro will pick platform.web.ts for web and platform.native.ts for native.
// This fallback should never be used directly.
export { getDatabase } from './platform.native';
