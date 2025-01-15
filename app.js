(function() {
  // Проверяем, запущено ли приложение в Telegram и не на мобильном устройстве
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) {
    const platform = Telegram.WebApp.platform;

    // Если платформа не является мобильной (iOS/Android) и это Telegram, блокируем загрузку
    if (platform !== 'ios' && platform !== 'android') {
      // Показываем сообщение об ошибке
      document.body.innerHTML = `
        <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Ошибка</h1>
          <p>Это приложение доступно только для мобильных устройств в Telegram.</p>
          <p>Пожалуйста, откройте его на смартфоне.</p>
        </div>
      `;
      return; // Останавливаем выполнение кода
    }
  } else {
    // Если это не Telegram (например, превью Bolt или браузер), запускаем приложение как обычно
    console.log('Приложение запущено вне Telegram. Продолжаем загрузку.');
  }

  // Остальной код приложения
  const versionElement = document.getElementById('version');
  const pointsElement = document.getElementById('points');
  const tgUsernameElement = document.getElementById('tg-username');
  const subscribeButton = document.querySelector('.subscribe');
  const likeButton = document.querySelector('.like');
  const inviteButton = document.querySelector('.invite');
  const headerTitle = document.getElementById('header-title');
  const headerTitleTasks = document.getElementById('header-title-tasks');
  const appVersion = 'v1.0';
  let points = 0;
  let lastLikeTime = 0;
  const likeCooldown = 60000;

  // Логотип
  const logoPlates = document.querySelectorAll('.logo-plate');
  const logoPosition = { x: 50, y: 120 };

  function updateLogoPosition() {
    logoPlates.forEach(plate => {
      plate.style.left = `${logoPosition.x}px`;
      plate.style.top = `${logoPosition.y}px`;
    });
  }

  function addPoints(amount) {
    points += amount;
    pointsElement.textContent = points;
  }

  // Initialize version
  versionElement.textContent = appVersion;

  // Get Telegram username
  function initTelegram() {
    try {
      if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.username) {
        const username = Telegram.WebApp.initDataUnsafe.user.username;
        tgUsernameElement.textContent = username || 'unknown';
      } else {
        tgUsernameElement.textContent = 'unknown';
      }
    } catch (error) {
      console.error('Error getting Telegram username:', error);
      tgUsernameElement.textContent = 'unknown';
    }
  }

  // Initialize Telegram WebApp
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    initTelegram();
  } else {
    console.warn('Telegram WebApp is not available. Running in standalone mode.');
    tgUsernameElement.textContent = 'unknown';
  }

  // Sync header titles
  if (headerTitle) {
    headerTitle.addEventListener('input', () => {
      if (headerTitleTasks) {
        headerTitleTasks.textContent = headerTitle.textContent;
      }
    });
  }

  // Navigation handlers
  document.addEventListener('DOMContentLoaded', () => {
    const mainScreen = document.getElementById('main-screen');
    const tasksScreen = document.getElementById('tasks-screen');
    const aboutScreen = document.getElementById('about-screen');
    const mainButtons = document.querySelectorAll('.main-btn');
    const tasksButtons = document.querySelectorAll('.tasks-btn');
    const aboutButtons = document.querySelectorAll('.about-btn');

    // Show main screen by default
    if (mainScreen) mainScreen.style.display = 'block';
    if (tasksScreen) tasksScreen.style.display = 'none';
    if (aboutScreen) aboutScreen.style.display = 'none';

    // Add event listeners to all MAIN buttons
    mainButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (tasksScreen) tasksScreen.style.display = 'none';
        if (aboutScreen) aboutScreen.style.display = 'none';
        if (mainScreen) mainScreen.style.display = 'block';
      });
    });

    // Add event listeners to all TASKS buttons
    tasksButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (mainScreen) mainScreen.style.display = 'none';
        if (aboutScreen) aboutScreen.style.display = 'none';
        if (tasksScreen) tasksScreen.style.display = 'block';
      });
    });

    // Add event listeners to all ABOUT buttons
    aboutButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (mainScreen) mainScreen.style.display = 'none';
        if (tasksScreen) tasksScreen.style.display = 'none';
        if (aboutScreen) aboutScreen.style.display = 'block';
      });
    });

    // Initial logo position
    updateLogoPosition();
  });

  // Создаем Daily Check-in плашку только на странице main
  const mainScreen = document.getElementById('main-screen');
  if (mainScreen) {
    const dailyCheckIn = document.createElement('div');
    dailyCheckIn.className = 'daily-check-in';
    dailyCheckIn.innerHTML = `
      <div class="daily-check-in-text">
        <div>daily</div>
        <div>check-in</div>
      </div>
    `;
    mainScreen.appendChild(dailyCheckIn);

    // Создаем новую плашку Timer только на странице main
    const timer = document.createElement('div');
    timer.className = 'timer';
    timer.innerHTML = `
      <div class="timer-text">00:00:00</div>
    `;
    mainScreen.appendChild(timer);
  }
})();
