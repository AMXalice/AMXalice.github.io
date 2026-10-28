/* Content, anchors and native video controls also work without JavaScript. */
document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '展开导航');
  navigation.classList.remove('is-open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

const videos = [...document.querySelectorAll('video')];
videos.forEach((video) => {
  const shell = video.closest('.video-shell');
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'video-play';
  playButton.setAttribute('aria-label', `播放${video.getAttribute('aria-label')}`);
  playButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5v17l15-8.5z"/></svg>';
  shell.append(playButton);

  const clearError = () => {
    shell.classList.remove('is-error');
    if (shell.nextElementSibling?.classList.contains('play-error')) {
      shell.nextElementSibling.remove();
    }
  };
  const showError = () => {
    shell.classList.add('is-error');
    if (shell.nextElementSibling?.classList.contains('play-error')) return;
    const message = document.createElement('p');
    message.className = 'play-error';
    message.setAttribute('role', 'status');
    message.append('视频暂时无法播放，请刷新重试，或');
    const link = document.createElement('a');
    link.href = video.querySelector('source').getAttribute('src');
    link.textContent = '打开视频';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    message.append(link, '。');
    shell.after(message);
  };
  playButton.addEventListener('click', () => {
    const playback = video.play();
    video.focus({ preventScroll: true });
    playback?.catch((error) => {
      if (error.name !== 'AbortError') showError();
    });
  });
  video.addEventListener('play', () => {
    clearError();
    shell.classList.add('is-playing');
    videos.forEach((other) => { if (other !== video) other.pause(); });
  });
  video.addEventListener('pause', () => shell.classList.remove('is-playing'));
  video.addEventListener('ended', () => shell.classList.remove('is-playing'));
  video.addEventListener('loadeddata', clearError);
  video.addEventListener('error', showError);
  video.querySelector('source').addEventListener('error', showError);
});

if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (!visible.length) return;
    const id = visible[0].target.id;
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}
