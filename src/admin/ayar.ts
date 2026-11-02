// CMS sunucusunun (Google Apps Script web uygulaması) adresi. Kurulum: docs/cms-sunucu/KURULUM.md
// Kurulumdan sonra VARSAYILAN'a /exec adresi yazılır. Derlemede PUBLIC_CMS_SUNUCU verilirse o kullanılır (test için).
const VARSAYILAN = '';
export const SUNUCU: string = (import.meta as any).env?.PUBLIC_CMS_SUNUCU || VARSAYILAN;
