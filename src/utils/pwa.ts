import { Platform } from 'react-native';

// Injeta as tags de PWA no <head> em runtime (o export web do Expo não gera
// manifest nem meta tags de instalação por padrão). Torna o app instalável
// na tela inicial do celular (Adicionar à tela de início) e habilita offline.
export function configurePWA(): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const head = document.head;

  const ensureMeta = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const ensureLink = (rel: string, href: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // Caminhos relativos para funcionar tanto na raiz (Vercel) quanto em
  // subpasta (GitHub Pages: /Dharman-Claude-Code/).
  const base = document.baseURI.replace(/[^/]*$/, ''); // diretório atual

  document.title = 'Protocolo Peptídeos';
  ensureMeta('theme-color', '#0F0F0F');
  ensureMeta('mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  ensureMeta('apple-mobile-web-app-title', 'Peptídeos');
  ensureLink('manifest', `${base}manifest.json`);
  ensureLink('apple-touch-icon', `${base}apple-touch-icon.png`);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${base}sw.js`).catch(() => {
      /* ignora falha de registro do SW */
    });
  }
}
