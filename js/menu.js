document.addEventListener("DOMContentLoaded", () => {
  playBgm(bgmTitle);
  // タイトル → ストーリー
  const titleStartBtn =
    document.getElementById("titleStartBtn");

  if (titleStartBtn) {
    titleStartBtn.addEventListener("click", () => {
      console.log("ゲーム開始クリック");

showScreen("storyScreen");

if (typeof playBgm === "function") {
  playBgm(bgmStory);
}

if (typeof startStory === "function") {
  startStory();
}
    });
  }

  // メニュー → FX
  const fxMenuBtn =
    document.getElementById("fxMenuBtn");

  if (fxMenuBtn) {
    fxMenuBtn.addEventListener("click", () => {
showScreen("fxScreen");

if (typeof playBgm === "function") {
  playBgm(bgmFX);
}

if (typeof initFXScreen === "function") {
  initFXScreen();
}
    });
  }

  // メニュー → 株価
  const stockMenuBtn =
    document.getElementById("stockMenuBtn");

  if (stockMenuBtn) {
    stockMenuBtn.addEventListener("click", () => {
      showScreen("stockScreen");
      if (typeof playBgm === "function") {
       playBgm(bgmMenu);
      }
    });
  }

  // FX → メニュー
const backToMenuFromFX =
  document.getElementById("backToMenuFromFX");

if (backToMenuFromFX) {

  backToMenuFromFX.addEventListener(
    "click",
    () => {

      if (typeof playBgm === "function") {
        playBgm(bgmMenu);
      }

      showScreen("menuScreen");

    }
  );

}

  // 株価 → メニュー
const backToMenuFromStock =
  document.getElementById("backToMenuFromStock");

if (backToMenuFromStock) {

  backToMenuFromStock.addEventListener(
    "click",
    () => {

      if (typeof playBgm === "function") {
        playBgm(bgmMenu);
      }

      showScreen("menuScreen");

    }
  );

}
  // GAME OVER → メニュー
  const gameOverMenuBtn =
    document.getElementById("gameOverMenuBtn");

  if (gameOverMenuBtn) {
    gameOverMenuBtn.addEventListener("click", () => {
      showScreen("menuScreen");
    });
  }

  // リトライ
  const retryBtn =
    document.getElementById("retryBtn");

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      location.reload();
    });
  }

});

// =====================
// FX → メニュー
// =====================

const backToMenuFromFX =
  document.getElementById(
    "backToMenuFromFX"
  );

if (backToMenuFromFX) {

  backToMenuFromFX.addEventListener(
    "click",
    () => {

      showScreen("menuScreen");

    }
  );

}
