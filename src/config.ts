interface RuntimeEnv {
  VITE_API_URL?: string;
}

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

const DEV_ENV: RuntimeEnv = import.meta.env.DEV
  ? { VITE_API_URL: import.meta.env.VITE_API_URL }
  : {};

function read(key: keyof RuntimeEnv): string {
  const value = window.__ENV__?.[key] || DEV_ENV[key];
  if (!value) {
    console.error(`[config] ${key} is not defined: check config.js / container environment`);
    return '';
  }
  return value;
}

export const API_URL = read('VITE_API_URL');
