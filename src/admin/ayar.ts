// CMS sunucusunun (Google Apps Script web uygulaması) adresi. Kurulum: docs/cms-sunucu/KURULUM.md
// Kurulumdan sonra VARSAYILAN'a /exec adresi yazılır. Derlemede PUBLIC_CMS_SUNUCU verilirse o kullanılır (test için).
const VARSAYILAN = 'https://script.google.com/macros/s/AKfycbzrqhwEFdBWuQtbt1sY2q5sa4eUkiwDYIt4eKb5KcOUaX1JNl6pOsWbCd-qtysTZoePYw/exec';
export const SUNUCU: string = (import.meta as any).env?.PUBLIC_CMS_SUNUCU || VARSAYILAN;
