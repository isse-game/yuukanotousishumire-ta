// =====================
// BGM / SE
// =====================

const bgmTitle =
  new Audio("audio/bgm_title.mp3");

const bgmStory =
  new Audio("audio/bgm_story.mp3");

const bgmMenu =
  new Audio("audio/bgm_menu.mp3");

// ファイル名が bgm_fxstage.mp3 ならこれでOK
const bgmFX =
  new Audio("audio/bgm_FXstage.mp3");

const bgmStock =
  new Audio("audio/bgm_kabustage.mp3");

const bgmList = [
  bgmTitle,
  bgmStory,
  bgmMenu,
  bgmFX,
  bgmStock
];

bgmList.forEach(bgm => {
  bgm.loop = true;
  bgm.volume = 0.4;
});

const seToku =
  new Audio("audio/se_toku.mp3");

const seSonn =
  new Audio("audio/se_sonn.mp3");

const seClear =
  new Audio("audio/se_clear.mp3");

const seGameOver =
  new Audio("audio/se_gameover.mp3");

[
  seToku,
  seSonn,
  seClear,
  seGameOver
].forEach(se => {
  se.volume = 0.7;
});

// =====================
// BGM停止
// =====================

function stopAllBgm() {
  bgmList.forEach(bgm => {
    bgm.pause();
    bgm.currentTime = 0;
  });
}

// =====================
// BGM再生
// =====================

function playBgm(bgm) {
  if (!bgm) return;

  stopAllBgm();

  bgm.currentTime = 0;
  bgm.play().catch(() => {});
}

// =====================
// SE再生
// =====================

function playSe(se) {
  if (!se) return;

  se.currentTime = 0;
  se.play().catch(() => {});
}