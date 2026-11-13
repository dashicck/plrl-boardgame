(() => {
  const steps = [...document.querySelectorAll('.guide-step[data-reveal]')];
  if (!steps.length) return;

  if (!('IntersectionObserver' in window)) {
    steps.forEach(step => step.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('has-scroll-reveal');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });

  steps.forEach(step => observer.observe(step));
})();

(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Только выбранные фотографии; порядок соответствует номерам, выбранным пользователем.
  const photos = [
    'assets/hero-bg-02.jpg',
    'assets/hero-bg-10.jpg',
    'assets/hero-bg-03.jpg',
    'assets/hero-bg-05.jpg',
    'assets/hero-bg-07.jpg',
    'assets/hero-bg-11.jpg'
  ];

  const interval = 4500;
  const fadeDuration = 450;
  let active = 0;
  let timer = null;
  let switching = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Загружаем фотографии заранее, чтобы смена фона не показывала пустой кадр.
  photos.slice(1).forEach(src => {
    const image = new Image();
    image.src = src;
  });

  function showNext() {
    if (switching || reducedMotion.matches) return;
    const next = (active + 1) % photos.length;
    switching = true;
    const preload = new Image();

    preload.onload = () => {
      hero.classList.add('is-switching');
      window.setTimeout(() => {
        hero.style.setProperty('--hero-photo', `url("${photos[next]}")`);
        active = next;
        hero.classList.remove('is-switching');
        switching = false;
      }, fadeDuration);
    };
    preload.onerror = () => { switching = false; };
    preload.src = photos[next];
  }

  // Первый фон уже задан стилями; далее фотографии меняются автоматически.
  if (!reducedMotion.matches) {
    timer = window.setInterval(showNext, interval);
  }

  // Если настройка уменьшения движения изменилась во время просмотра,
  // автоматически останавливаем или возобновляем смену фона.
  reducedMotion.addEventListener?.('change', event => {
    if (timer) window.clearInterval(timer);
    timer = null;
    if (!event.matches) timer = window.setInterval(showNext, interval);
  });
})();




(() => {
    const dice = [...document.querySelectorAll('#prep-panel-4 .demo-die[data-faces]')];
    const rollButton = document.querySelector('#prep-panel-4 [data-roll-all]');

    if (!dice.length || !rollButton) return;

    const faceNames = ['front', 'right', 'back', 'left', 'top', 'bottom'];

    // Повороты, при которых выбранная грань смотрит строго на зрителя.
    // В положении покоя видна только одна грань, без боковых плоскостей.
    const faceToFront = [
        { x: 0, y: 0, z: 0 },       // front
        { x: 0, y: -90, z: 0 },    // right
        { x: 0, y: 180, z: 0 },    // back
        { x: 0, y: 90, z: 0 },     // left
        { x: -90, y: 0, z: 0 },    // top
        { x: 90, y: 0, z: 0 }      // bottom
    ];

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rolling = false;

    const random = (min, max) => Math.random() * (max - min) + min;
    const rotationString = r =>
        `rotateY(${r.y}deg) rotateX(${r.x}deg) rotateZ(${r.z}deg)`;

    dice.forEach(die => {
        const cube = die.querySelector('.die-cube');
        if (!cube) return;

        // Не дублируем грани при повторной инициализации.
        if (!cube.querySelector('.die-face')) {
            const values = die.dataset.faces.split('|');
            faceNames.forEach((name, index) => {
                const face = document.createElement('span');
                face.className = `die-face die-face--${name}`;
                face.textContent = values[index] ?? '';
                face.setAttribute('aria-hidden', 'true');
                cube.appendChild(face);
            });
        }

        let shadow = die.querySelector('.die-contact-shadow');
        if (!shadow) {
            shadow = document.createElement('span');
            shadow.className = 'die-contact-shadow';
            die.prepend(shadow);
        }

        die._dicePosition = { x: 0, y: 0 };
        die._diceRotation = { x: 0, y: 0, z: 0 };
        die.style.transform = 'translate3d(0, 0, 0)';
        cube.style.transform = rotationString(die._diceRotation);
    });

    function rollOneDie(die, index) {
        const cube = die.querySelector('.die-cube');
        const shadow = die.querySelector('.die-contact-shadow');
        const values = die.dataset.faces.split('|');
        const resultIndex = Math.floor(Math.random() * values.length);
        const faceValue = values[resultIndex];
        const target = faceToFront[resultIndex];

        const startPosition = { ...die._dicePosition };
        const startRotation = { ...die._diceRotation };

        // Полные обороты не меняют выбранную финальную грань.
        const finalRotation = {
            x: target.x + (Math.random() > .5 ? 720 : -720),
            y: target.y + (Math.random() > .5 ? 720 : -720),
            z: target.z + (Math.random() > .5 ? 720 : -720)
        };
        const duration = random(1450, 1900);
        const delay = index * 85;
        const finalPosition = { x: random(-5, 5), y: random(-3, 3) };

        if (reducedMotion.matches) {
            die.style.transform = `translate3d(${finalPosition.x}px, ${finalPosition.y}px, 0)`;
            cube.style.transform = rotationString(target);
            die._dicePosition = finalPosition;
            die._diceRotation = target;
            die.dataset.result = faceValue;
            return Promise.resolve();
        }

        const movement = die.animate([
            { transform: `translate3d(${startPosition.x}px, ${startPosition.y}px, 0)`, offset: 0 },
            { transform: `translate3d(${startPosition.x + random(-24, 24)}px, ${startPosition.y - random(54, 76)}px, 0)`, offset: .28 },
            { transform: `translate3d(${finalPosition.x + random(-8, 8)}px, ${finalPosition.y - 8}px, 0)`, offset: .82 },
            { transform: `translate3d(${finalPosition.x}px, ${finalPosition.y + 2}px, 0)`, offset: .93 },
            { transform: `translate3d(${finalPosition.x}px, ${finalPosition.y}px, 0)`, offset: 1 }
        ], {
            duration, delay, easing: 'cubic-bezier(.18,.72,.22,1)', fill: 'forwards'
        });

        const spin = cube.animate([
            { transform: rotationString(startRotation), offset: 0 },
            {
                transform: rotationString({
                    x: startRotation.x + random(180, 360),
                    y: startRotation.y + random(220, 440),
                    z: startRotation.z + random(180, 360)
                }),
                offset: .46
            },
            {
                transform: rotationString({
                    x: finalRotation.x + random(-35, 35),
                    y: finalRotation.y + random(-35, 35),
                    z: finalRotation.z + random(-35, 35)
                }),
                offset: .82
            },
            { transform: rotationString(finalRotation), offset: 1 }
        ], {
            duration, delay, easing: 'cubic-bezier(.16,.7,.2,1)', fill: 'forwards'
        });

        const shadowAnimation = shadow.animate([
            { transform: 'translate(-50%, -50%) scale(.78)', opacity: .62, filter: 'blur(7px)', offset: 0 },
            { transform: 'translate(-50%, -50%) scale(1.35)', opacity: .22, filter: 'blur(13px)', offset: .3 },
            { transform: 'translate(-50%, -50%) scale(1.18)', opacity: .3, filter: 'blur(11px)', offset: .72 },
            { transform: 'translate(-50%, -50%) scale(.82)', opacity: .7, filter: 'blur(6px)', offset: .94 },
            { transform: 'translate(-50%, -50%) scale(.9)', opacity: .58, filter: 'blur(7px)', offset: 1 }
        ], { duration, delay, easing: 'ease-out', fill: 'forwards' });

        return Promise.all([movement.finished, spin.finished, shadowAnimation.finished]).then(() => {
            die._dicePosition = finalPosition;
            // Сохраняем точное положение без случайного углового отклонения.
            die._diceRotation = target;
            die.style.transform = `translate3d(${finalPosition.x}px, ${finalPosition.y}px, 0)`;
            cube.style.transform = rotationString(target);
            shadow.style.transform = 'translate(-50%, -50%) scale(.9)';
            shadow.style.opacity = '.58';
            shadow.style.filter = 'blur(7px)';
            die.dataset.result = faceValue;
            movement.cancel();
            spin.cancel();
            shadowAnimation.cancel();
        });
    }

    async function rollAllDice() {
        if (rolling) return;
        rolling = true;
        rollButton.disabled = true;
        rollButton.textContent = 'Кубики бросаются...';

        try {
            await Promise.all(dice.map((die, index) => rollOneDie(die, index)));
        } finally {
            rollButton.disabled = false;
            rollButton.innerHTML = 'Бросить все кубики <span aria-hidden="true">↗</span>';
            rolling = false;
        }
    }

    rollButton.addEventListener('click', rollAllDice);
})();

(() => {
  document.querySelectorAll('.field-unfold-control').forEach(control => {
    const caption = control.parentElement.querySelector('.field-caption');
    control.addEventListener('click', () => {
      const open = control.getAttribute('aria-expanded') !== 'true';
      control.setAttribute('aria-expanded', String(open));
      control.classList.toggle('is-folded', !open);
      control.parentElement.classList.toggle('is-open', open);
      control.setAttribute('aria-label', open ? 'Свернуть большое игровое поле' : 'Разложить большое игровое поле');
      caption.textContent = open ? 'Большое поле разложено — можно начинать партию' : 'Большое поле';
    });
  });
})();

(() => {
  const tabs = [...document.querySelectorAll('.prep-step[role="tab"]')];
  const panels = [...document.querySelectorAll('.prep-panel[role="tabpanel"]')];
  if (!tabs.length || !panels.length) return;

  function activate(index, focus = false) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
      panel.classList.toggle('is-active', i === index);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(next, true);
    });
  });

  // Буклет в шаге 3 отображается статично, без перелистывания.
})();

// Восстановление переключения четырёх шагов подготовки к партии
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.prep-step[role="tab"]');
    const panels = document.querySelectorAll('.prep-panel[role="tabpanel"]');

    if (!tabs.length || !panels.length) {
        console.error('Не найдены вкладки или панели подготовки');
        return;
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {

            tabs.forEach((item, i) => {
                const active = i === index;

                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
                item.tabIndex = active ? 0 : -1;
            });

            panels.forEach((panel, i) => {
                panel.hidden = i !== index;
                panel.classList.toggle('is-active', i === index);
            });

        });
    });
});