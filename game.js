const MAX_LEVEL = 1000;
const LANES = 3;

const i18n = {
  pt: {
    gameTitle: "Rush 1000",
    gameSubtitle: "1000 fases com dificuldade gradual",
    levelLabel: "Fase",
    goalLabel: "Meta",
    progressLabel: "Progresso",
    tips: "Desvie dos blocos vermelhos. Complete a meta para avançar para a próxima fase.",
    start: "Iniciar",
    restart: "Jogar novamente",
    readyTitle: "Prepare-se!",
    readyText: "Toque em Iniciar para jogar.",
    winTitle: "Fase concluída!",
    winText: (level) => `Você avançou para a fase ${level}.`,
    loseTitle: "Você perdeu!",
    loseText: "Tente de novo. A dificuldade aumenta de forma suave em cada fase.",
    finalTitle: "Parabéns!",
    finalText: "Você concluiu as 1000 fases!"
  },
  en: {
    gameTitle: "Rush 1000",
    gameSubtitle: "1000 stages with smooth difficulty scaling",
    levelLabel: "Stage",
    goalLabel: "Goal",
    progressLabel: "Progress",
    tips: "Dodge red blocks. Reach the goal to move to the next stage.",
    start: "Start",
    restart: "Play again",
    readyTitle: "Get ready!",
    readyText: "Tap Start to play.",
    winTitle: "Stage cleared!",
    winText: (level) => `You advanced to stage ${level}.`,
    loseTitle: "You lost!",
    loseText: "Try again. Difficulty increases gently each stage.",
    finalTitle: "Awesome!",
    finalText: "You completed all 1000 stages!"
  }
};

const ui = {
  canvas: document.getElementById("gameCanvas"),
  overlay: document.getElementById("overlay"),
  statusTitle: document.getElementById("statusTitle"),
  statusText: document.getElementById("statusText"),
  startButton: document.getElementById("startButton"),
  levelValue: document.getElementById("levelValue"),
  goalValue: document.getElementById("goalValue"),
  progressValue: document.getElementById("progressValue"),
  leftBtn: document.getElementById("leftBtn"),
  rightBtn: document.getElementById("rightBtn"),
  languageToggle: document.getElementById("languageToggle"),
  gameTitle: document.getElementById("gameTitle"),
  gameSubtitle: document.getElementById("gameSubtitle"),
  levelLabel: document.getElementById("levelLabel"),
  goalLabel: document.getElementById("goalLabel"),
  progressLabel: document.getElementById("progressLabel"),
  tips: document.getElementById("tips")
};

const ctx = ui.canvas.getContext("2d");
const game = {
  lang: "pt",
  running: false,
  level: 1,
  lane: 1,
  obstacles: [],
  score: 0,
  lastSpawn: 0,
  lastTick: 0
};

const laneWidth = ui.canvas.width / LANES;
const player = {
  width: laneWidth * 0.48,
  height: 26,
  y: ui.canvas.height - 52
};

function levelConfig(level) {
  const normalized = (level - 1) / (MAX_LEVEL - 1);
  return {
    speed: 2.2 + normalized * 3.8,
    spawnInterval: 940 - normalized * 430,
    goal: Math.floor(8 + normalized * 44)
  };
}

function setLanguage(lang) {
  game.lang = lang;
  const t = i18n[lang];
  ui.gameTitle.textContent = t.gameTitle;
  ui.gameSubtitle.textContent = t.gameSubtitle;
  ui.levelLabel.textContent = t.levelLabel;
  ui.goalLabel.textContent = t.goalLabel;
  ui.progressLabel.textContent = t.progressLabel;
  ui.startButton.textContent = t.start;
  ui.tips.textContent = t.tips;
  if (!game.running) {
    ui.statusTitle.textContent = t.readyTitle;
    ui.statusText.textContent = t.readyText;
  }
}

function updateHud() {
  const cfg = levelConfig(game.level);
  ui.levelValue.textContent = game.level;
  ui.goalValue.textContent = cfg.goal;
  ui.progressValue.textContent = game.score;
}

function movePlayer(direction) {
  game.lane = Math.min(LANES - 1, Math.max(0, game.lane + direction));
}

function spawnObstacle(timestamp) {
  const cfg = levelConfig(game.level);
  if (timestamp - game.lastSpawn < cfg.spawnInterval) return;
  game.lastSpawn = timestamp;

  const lane = Math.floor(Math.random() * LANES);
  game.obstacles.push({
    lane,
    y: -36,
    size: laneWidth * 0.45
  });
}

function checkCollision(obstacle) {
  const playerX = game.lane * laneWidth + (laneWidth - player.width) / 2;
  const obstacleX = obstacle.lane * laneWidth + (laneWidth - obstacle.size) / 2;

  return (
    obstacle.y + obstacle.size > player.y &&
    obstacle.y < player.y + player.height &&
    obstacleX < playerX + player.width &&
    obstacleX + obstacle.size > playerX
  );
}

function draw() {
  ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);

  ctx.strokeStyle = "#20325f";
  ctx.lineWidth = 2;
  for (let i = 1; i < LANES; i += 1) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ui.canvas.height);
    ctx.stroke();
  }

  const playerX = game.lane * laneWidth + (laneWidth - player.width) / 2;
  ctx.fillStyle = "#4ed5ff";
  ctx.fillRect(playerX, player.y, player.width, player.height);

  ctx.fillStyle = "#ff5168";
  game.obstacles.forEach((obs) => {
    const obstacleX = obs.lane * laneWidth + (laneWidth - obs.size) / 2;
    ctx.fillRect(obstacleX, obs.y, obs.size, obs.size);
  });
}

function showOverlay(title, text, buttonText) {
  ui.overlay.classList.remove("hidden");
  ui.statusTitle.textContent = title;
  ui.statusText.textContent = text;
  ui.startButton.textContent = buttonText;
}

function hideOverlay() {
  ui.overlay.classList.add("hidden");
}

function onLose() {
  const t = i18n[game.lang];
  game.running = false;
  showOverlay(t.loseTitle, t.loseText, t.restart);
}

function onWinLevel() {
  const t = i18n[game.lang];
  if (game.level >= MAX_LEVEL) {
    game.running = false;
    showOverlay(t.finalTitle, t.finalText, t.restart);
    game.level = 1;
    return;
  }

  game.level += 1;
  game.score = 0;
  game.obstacles = [];
  game.lastSpawn = 0;
  updateHud();
  game.running = false;
  showOverlay(t.winTitle, t.winText(game.level), t.start);
}

function resetCurrentLevel() {
  game.score = 0;
  game.obstacles = [];
  game.lane = 1;
  game.lastSpawn = 0;
  updateHud();
}

function gameLoop(timestamp) {
  if (!game.running) {
    draw();
    return;
  }

  const delta = timestamp - game.lastTick;
  game.lastTick = timestamp;
  const cfg = levelConfig(game.level);

  spawnObstacle(timestamp);

  for (let i = game.obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = game.obstacles[i];
    obstacle.y += cfg.speed * (delta / 16.67);

    if (checkCollision(obstacle)) {
      onLose();
      break;
    }

    if (obstacle.y > ui.canvas.height + obstacle.size) {
      game.obstacles.splice(i, 1);
      game.score += 1;
      updateHud();
      if (game.score >= cfg.goal) {
        onWinLevel();
        break;
      }
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  const endReached = game.level === 1 && ui.statusTitle.textContent === i18n[game.lang].finalTitle;
  if (endReached) {
    game.level = 1;
  }
  hideOverlay();
  resetCurrentLevel();
  game.running = true;
  game.lastTick = performance.now();
  requestAnimationFrame(gameLoop);
}

ui.startButton.addEventListener("click", startGame);
ui.leftBtn.addEventListener("click", () => movePlayer(-1));
ui.rightBtn.addEventListener("click", () => movePlayer(1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") movePlayer(-1);
  if (event.key === "ArrowRight") movePlayer(1);
});

ui.canvas.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  const rect = ui.canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const zone = rect.width / 2;
  if (x < zone) movePlayer(-1);
  else movePlayer(1);
});

ui.languageToggle.addEventListener("click", () => {
  setLanguage(game.lang === "pt" ? "en" : "pt");
});

setLanguage("pt");
updateHud();
draw();
