(function() {
  // Конфигурация
  const API_URL = 'http://localhost:3000/api';
  let currentUser = null;
  let authToken = null;

  // Проверка платформы и инициализация
  function initializeApp() {
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) {
      const platform = Telegram.WebApp.platform;
      
      if (platform !== 'ios' && platform !== 'android') {
        showPlatformError();
        return;
      }
      
      Telegram.WebApp.ready();
      setupTelegramIntegration();
    } else {
      console.log('Режим разработки: вне Telegram');
      setupDevEnvironment();
    }
  }

  function showPlatformError() {
    document.body.innerHTML = `
      <div class="error-container">
        <h1>${translations[currentLanguage].errorTitle}</h1>
        <p>${translations[currentLanguage].errorMessage}</p>
      </div>
    `;
  }

  // Интеграция с Telegram
  async function setupTelegramIntegration() {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: Telegram.WebApp.initData })
      });

      const data = await response.json();
      
      authToken = data.token;
      currentUser = {
        id: data.userId,
        username: data.username,
        points: data.points
      };

      localStorage.setItem('authToken', authToken);
      updateUI();
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      Telegram.WebApp.showAlert(translations[currentLanguage].authError);
    }
  }

  // Обновление интерфейса
  function updateUI() {
    document.getElementById('points').textContent = currentUser.points;
    document.getElementById('tg-username').textContent = currentUser.username;
    updateTexts();
  }

  // Обработчик начисления очков
  async function handlePointsAction(amount, actionType) {
    try {
      const response = await fetch(`${API_URL}/update-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ amount, actionType })
      });

      const result = await response.json();
      
      if (result.success) {
        currentUser.points = result.newBalance;
        updateUI();
        showSuccessAlert(amount);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showErrorAlert(error.message);
    }
  }

  // Вспомогательные функции
  function showSuccessAlert(amount) {
    const message = translations[currentLanguage].pointsAdded
      .replace('{amount}', amount);
    
    if (window.Telegram && Telegram.WebApp.showAlert) {
      Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  function showErrorAlert(message) {
    const errorMessage = translations[currentLanguage].defaultError;
    
    if (window.Telegram && Telegram.WebApp.showAlert) {
      Telegram.WebApp.showAlert(errorMessage);
    } else {
      alert(`${errorMessage}: ${message}`);
    }
  }

  // Инициализация событий
  function setupEventListeners() {
    // Кнопка Daily Check-In
    document.querySelector('.daily-check-in').addEventListener('click', () => {
      handlePointsAction(30, 'daily');
    });

    // Остальные кнопки заданий
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = parseInt(this.querySelector('.task-points').textContent.match(/\d+/)[0]);
        const actionType = this.classList[1]; // invite, subscribe, like, donate
        handlePointsAction(amount, actionType);
      });
    });

    // Кнопка перевода языка
    document.querySelector('.custom-plate').addEventListener('click', () => {
      currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
      updateTexts();
    });

    // Навигационные кнопки
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', handleNavigation);
    });
  }

  // Обработка навигации
  function handleNavigation(event) {
    const target = event.target.classList[1];
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    document.getElementById(`${target}-screen`).style.display = 'block';
  }

  // Добавляем систему перевода
  let currentLanguage = 'en'; // По умолчанию русский

  const translations = {
    ru: {
      about: `SUN CITY - это пост-апокалиптическая ролевая игра с квестами, путешествиями по карте мира, ролевой системой, механикой боя и развитием персонажа. Игра SUN CITY была вдохновлена играми Fallout и Wasteland, а также книгами братьев Стругацких.

Мир игры - Великая Пустыня, населенная выжившими людьми (и не только людьми). Однажды, проснувшись, люди увидели полуразрушенные и заброшенные города, а вокруг - бескрайнюю пустыню. Никто не мог вспомнить, что было вчера. Им пришлось начинать все сначала. С момента «Сотворения мира» прошло шестьдесят лет...

Вы - житель деревни из племени Ариано. На вашу деревню напали рейдеры, и старейшина деревни просит вас отправиться в Солнечный город за помощью. Судьба деревни... и мира... зависит от вас.

Пока мы работаем над выпуском игры, вы можете выполнять задания, зарабатывать очки и делать пожертвования. Позже, когда игра будет выпущена, накопленные очки можно будет обменять на ценные внутри-игровые предметы и криптовалюту.

СЛЕДИТЕ ЗА ОБНОВЛЕНИЯМИ НА ТЕЛЕГРАМ-КАНАЛЕ ИГРЫ. ВЫ МОЖЕТЕ НАЙТИ ЕГО В РАЗДЕЛЕ «ЗАДАНИЯ».`,
      buttons: {
        main: 'Главное',
        tasks: 'Задания',
        about: 'Игра',
        totalPoints: 'Общий Счёт',
        inviteFriend: 'Пригласить друга',
        subscribeTG: 'Подписаться TG',
        subscribeYoutube: 'Подписаться YouTube',
        likeTG: 'Лайк пост TG',
        likeYoutube: 'Лайк видео YouTube',
        donate: 'ДОНАТ 100 звёзд'
      }
    },
    en: {
      about: `SUN CITY is a post-apocalyptic RPG game with quests, world map travel, RPG system, leveling and combat mechanics. SUN CITY game was inspired by Fallout and Wasteland games, as well as books by brothers Strugatsky.

The world of the game is the Great Desert, inhabited by surviving humans (and not only humans). One day, people woke up and saw half-destroyed and abandoned cities, and a vast desert around them. No one could remembers what happened yesterday. They had to start all over again. Sixty years have passed since the "Creation of the World"...

You are a villager of the Ariano tribe. Your village has been attacked by raiders, and the village elder asks you to go to Sun City to bring help. The fate of the village... and the world... depends on you.

For now, while we are working hard to release the game, you can complete tasks, earn points, and make donations. Later on, when the game will be released, accumulated points can be exchanged for valuable in-game items and cryptocurrency.

CHECK THE GAME TELEGRAM CHANNEL FOR UPDATES. YOU CAN FIND IT IN TASKS SECTION.`,
      buttons: {
        main: 'Main',
        tasks: 'Tasks',
        about: 'About',
        totalPoints: 'Total Points',
        inviteFriend: 'Invite Friend',
        subscribeTG: 'Subscribe TG',
        subscribeYoutube: 'Subscribe YOUTUBE',
        likeTG: 'Like TG Post',
        likeYoutube: 'Like YOUTUBE Vid',
        donate: 'DONATE 100 STARS'
      }
    }
  };

  function updateTexts() {
    const lang = translations[currentLanguage];
    
    // Обновляем текст на странице About
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
      aboutContent.innerHTML = `<p>${lang.about.split('\n\n').join('</p><p>')}</p>`;
    }

    // Обновляем кнопки
    document.querySelectorAll('.nav-btn.main-btn').forEach(btn => {
      btn.textContent = lang.buttons.main;
    });
    
    document.querySelectorAll('.nav-btn.tasks-btn').forEach(btn => {
      btn.textContent = lang.buttons.tasks;
    });
    
    document.querySelectorAll('.nav-btn.about-btn').forEach(btn => {
      btn.textContent = lang.buttons.about;
    });

    // Обновляем Total Points
    const pointsElement = document.querySelector('.scoreboard span:first-child');
    if (pointsElement) {
      pointsElement.textContent = lang.buttons.totalPoints;
    }

    // Обновляем тексты заданий
    const taskButtons = document.querySelectorAll('.btn');
    if (taskButtons.length > 0) {
      taskButtons[0].querySelector('.task-text').textContent = lang.buttons.inviteFriend;
      taskButtons[1].querySelector('.task-text').textContent = lang.buttons.subscribeTG;
      taskButtons[2].querySelector('.task-text').textContent = lang.buttons.subscribeYoutube;
      taskButtons[3].querySelector('.task-text').textContent = lang.buttons.likeTG;
      taskButtons[4].querySelector('.task-text').textContent = lang.buttons.likeYoutube;
      taskButtons[5].querySelector('.task-text').textContent = lang.buttons.donate;
    }
  }

  // Добавляем обработчик для кнопки перевода
  document.querySelector('.custom-plate')?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    updateTexts();
  });

  // Инициализация текстов при загрузке
  document.addEventListener('DOMContentLoaded', () => {
    updateTexts();
  });

  // Воспроизведение музыки
  const audio = new Audio('miniappmusic.mp3');
  audio.loop = true;

  function playMusic() {
    audio.play().catch(error => {
      console.error('Ошибка воспроизведения музыки:', error);
    });
  }

  document.addEventListener('click', playMusic, { once: true });
  document.addEventListener('touchstart', playMusic, { once: true });

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

  // Добавляем свайп-навигацию
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50; // Минимальное расстояние для срабатывания свайпа
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Свайп вправо
        navigateToPreviousScreen();
      } else {
        // Свайп влево
        navigateToNextScreen();
      }
    }
  }

  function navigateToPreviousScreen() {
    const mainScreen = document.getElementById('main-screen');
    const tasksScreen = document.getElementById('tasks-screen');
    const aboutScreen = document.getElementById('about-screen');

    if (tasksScreen.style.display === 'block') {
      tasksScreen.style.display = 'none';
      mainScreen.style.display = 'block';
    } else if (aboutScreen.style.display === 'block') {
      aboutScreen.style.display = 'none';
      tasksScreen.style.display = 'block';
    }
  }

  function navigateToNextScreen() {
    const mainScreen = document.getElementById('main-screen');
    const tasksScreen = document.getElementById('tasks-screen');
    const aboutScreen = document.getElementById('about-screen');

    if (mainScreen.style.display === 'block') {
      mainScreen.style.display = 'none';
      tasksScreen.style.display = 'block';
    } else if (tasksScreen.style.display === 'block') {
      tasksScreen.style.display = 'none';
      aboutScreen.style.display = 'block';
    }
  }

  // Добавляем обработчики событий для свайпа
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
// Запуск приложения
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateTexts();
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      initTelegram();
    }
  });
})();