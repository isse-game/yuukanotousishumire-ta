// =====================
// 共通設定
// =====================

const TARGET_MONEY = 10000000;

let gameState = {
  currentMoney: 1000000,
  targetMoney: TARGET_MONEY
};

// =====================
// 画面切り替え
// =====================

function showScreen(screenId) {

  const current =
    document.querySelector(".screen.active");

  if (current) {

    current.classList.add("fade-out");

    setTimeout(() => {

      current.classList.remove("active");
      current.classList.remove("fade-out");

      const next =
        document.getElementById(screenId);

      next.classList.add("active");

      updateMoneyHud();

    }, 500);

  } else {

    const next =
      document.getElementById(screenId);

    next.classList.add("active");

    updateMoneyHud();
  }
}

// =====================
// 資金表示更新
// =====================

function updateMoneyHud() {
const targetEls = [
  document.getElementById("targetMoney"),
  document.getElementById("targetMoneyStock"),
  document.getElementById("targetMoneyStockMenu"),
  document.getElementById("targetMoneyStockTrade")
];

const currentEls = [
  document.getElementById("currentMoney"),
  document.getElementById("currentMoneyStock"),
  document.getElementById("currentMoneyStockMenu"),
  document.getElementById("currentMoneyStockTrade")
];

  targetEls.forEach(el => {
    if (el) el.textContent = gameState.targetMoney.toLocaleString();
  });

  currentEls.forEach(el => {
    if (el) el.textContent = Math.round(gameState.currentMoney).toLocaleString();
  });
}

// =====================
// 資金変更
// =====================

function setCurrentMoney(value) {
  gameState.currentMoney = Math.max(0, Number(value) || 0);
  updateMoneyHud();
  checkGameClear();
  checkGameOver();
}

function addCurrentMoney(value) {
  gameState.currentMoney += Number(value) || 0;
  gameState.currentMoney = Math.max(0, gameState.currentMoney);
  updateMoneyHud();
  checkGameClear();
  checkGameOver();
}

function checkGameClear() {
  if (gameState.currentMoney >= gameState.targetMoney) {

    if (typeof stopAllBgm === "function") {
      stopAllBgm();
    }

    if (typeof playSe === "function") {
      playSe(seClear);
    }

    showScreen("clearScreen");
  }
}

function checkGameOver() {
  if (gameState.currentMoney <= 0) {

    if (typeof stopAllBgm === "function") {
      stopAllBgm();
    }

    if (typeof playSe === "function") {
      playSe(seGameOver);
    }

    showScreen("gameOverScreen");
  }
}

// =====================
// 初期化
// =====================

document.addEventListener("DOMContentLoaded", () => {
  updateMoneyHud();
  showScreen("titleScreen");

  if (typeof playBgm === "function") {
    playBgm(bgmTitle);
  }
});
