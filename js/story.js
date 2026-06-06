// =====================
// ストーリー本文
// =====================

const storyPages = [

`ミレニアムサイエンススクール。

かつてはキヴォトス屈指の技術力を誇る学園だったが、
現在は深刻な資金不足に陥っていた。`,

`原因は二つ。

一つはリオ会長による
「エリドゥ建設計画」。

莫大な予算が投入された結果、
ミレニアムの財政は大きく圧迫された。`,

`そしてもう一つは、

コユキによる無計画な債権発行。

市場は混乱し、
ミレニアムはさらなる損失を抱えることとなった。`,

`このままでは
ミレニアムの未来は危うい。

ユウカは頭を抱えていた。`,

`そこでユウカは決断する。

為替市場。
株式市場。

あらゆる金融商品を駆使し、

ミレニアム再建資金を集めることを。`,

`目標資金

10,000,000 クレジット`,

`ミレニアム再建計画

開始`
];

let currentStoryPage = 0;
let typingTimer = null;

// =====================
// タイプライター表示
// =====================

function typeText(text, element, speed = 35) {

  clearInterval(typingTimer);

  element.textContent = "";

  let index = 0;

  typingTimer = setInterval(() => {

    element.textContent += text[index];

    index++;

    if (index >= text.length) {
      clearInterval(typingTimer);

      setTimeout(() => {
        showNextStoryPage();
      }, 1800);
    }

  }, speed);
}

// =====================
// 次ページ
// =====================

function showNextStoryPage() {

  currentStoryPage++;

  const textArea = document.getElementById("storyText");

  if (currentStoryPage >= storyPages.length) {

    const btn = document.getElementById("storyNextBtn");

    if (btn) {
      btn.classList.remove("hidden");
    }

    return;
  }

  textArea.style.opacity = 0;

  setTimeout(() => {

    textArea.style.opacity = 1;

    typeText(
      storyPages[currentStoryPage],
      textArea
    );

  }, 500);
}

// =====================
// ストーリー開始
// =====================

function startStory() {

  currentStoryPage = 0;

  const textArea =
    document.getElementById("storyText");

  const btn =
    document.getElementById("storyNextBtn");

  if (btn) {
    btn.classList.add("hidden");
  }

  textArea.style.opacity = 1;

  typeText(
    storyPages[0],
    textArea
  );
}

// =====================
// 初期化
// =====================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // メニューへボタン
    const btn =
      document.getElementById("storyNextBtn");

    if (btn) {

      btn.addEventListener(
        "click",
        () => {
          showScreen("menuScreen");
        }
      );

    }

    // スキップボタン
    const skipBtn =
      document.getElementById("storySkipBtn");

    if (skipBtn) {

      skipBtn.addEventListener(
        "click",
        () => {

          clearInterval(typingTimer);

          showScreen("menuScreen");

        }
      );

    }

  }
);