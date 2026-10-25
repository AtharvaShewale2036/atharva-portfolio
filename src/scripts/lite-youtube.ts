export function initLiteYouTube(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-yt]').forEach((a) => {
    if (a.dataset.bound) return;
    a.dataset.bound = '1';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1`;
      iframe.title = a.dataset.title ?? 'Video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      a.replaceChildren(iframe);
      a.removeAttribute('href');
    });
  });
}
