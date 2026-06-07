// =====================
// 株式シミュレーター
// =====================

let currentStockKey = null;
let stockInitialized = false;

const stockConfigs = {
  millennium: {
    name: "ミレニアム開発",
    price: 800,
    volatility: 0.035,
    trend: 0.08,
    eventPower: 0.09,
    bg: "images/mireniamu.png"
  },
  gehenna: {
    name: "ゲヘナ不動産",
    price: 500,
    volatility: 0.06,
    trend: 0.02,
    eventPower: 0.14,
    bg: "images/gehena.png"
  },
  trinity: {
    name: "トリニティ金融",
    price: 1200,
    volatility: 0.018,
    trend: 0.04,
    eventPower: 0.04,
    bg: "images/torinithi.png"
  },
  abydos: {
    name: "アビドス産業",
    price: 200,
    volatility: 0.055,
    trend: 0.03,
    eventPower: 0.13,
    bg: "images/abidosu.png"
  },
  hyakki: {
    name: "百鬼夜行観光",
    price: 400,
    volatility: 0.03,
    trend: 0.05,
    eventPower: 0.08,
    bg: "images/hyakkiyakou.png"
  }
};

const stockNews = {
  millennium: [
    ["新型AI発表。技術力への期待が高まっています。", 0.15],
    ["大型ゲームが大ヒット。収益拡大期待。", 0.13],
    ["ロボット開発に成功。株価に追い風。", 0.12],
    ["サーバー障害発生。投資家心理が悪化。", -0.10],
    ["大型プロジェクト延期。成長期待に陰り。", -0.13],
    ["AI革命成功！市場はミレニアム開発に熱狂しています。", 0.50]
  ],
  gehenna: [
    ["再開発計画が承認。地価上昇期待。", 0.18],
    ["大型商業施設が完成。不動産需要が拡大。", 0.15],
    ["治安悪化により投資家が警戒。", -0.15],
    ["建設遅延が発表。売りが優勢。", -0.16],
    ["資材価格高騰。利益率悪化懸念。", -0.14],
    ["キヴォトス最大再開発計画が始動！", 0.40]
  ],
  trinity: [
    ["最高益更新。安定成長が評価されています。", 0.08],
    ["高配当発表。買い安心感が広がる。", 0.07],
    ["格付け引き上げ。金融株に追い風。", 0.06],
    ["不良債権増加。慎重な売りが出ています。", -0.06],
    ["決算未達。上値が重い展開。", -0.07],
    ["史上最高益を発表。優良株として人気化。", 0.30]
  ],
  abydos: [
    ["新鉱脈発見。資源株として急騰。", 0.25],
    ["資源価格高騰。業績期待が高まる。", 0.20],
    ["政府支援決定。再建期待が浮上。", 0.22],
    ["採掘失敗。失望売りが広がる。", -0.22],
    ["資金繰り悪化。投資家心理が冷え込む。", -0.25],
    ["超巨大鉱脈発見！市場が大きく反応。", 0.80]
  ],
  hyakki: [
    ["大型祭り開催。観光客増加期待。", 0.12],
    ["温泉街再開発。観光需要が拡大。", 0.10],
    ["海外旅行客が増加。じわじわ買われる展開。", 0.09],
    ["祭り中止。観光需要に不安。", -0.10],
    ["交通障害発生。観光客減少懸念。", -0.09],
    ["世界的観光ブーム到来！百鬼夜行観光に注目集まる。", 0.50]
  ]
};

let stockState = {};

function initStockState() {
  Object.entries(stockConfigs).forEach(([key, cfg]) => {
    if (!stockState[key]) {
      stockState[key] = {
        price: cfg.price,
        shares: 0,
        avgPrice: 0,
        candles: []
      };
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initStockState();

  const buttons = {
    millenniumBtn: "millennium",
    gehennaBtn: "gehenna",
    trinityBtn: "trinity",
    abydosBtn: "abydos",
    hyakkiBtn: "hyakki"
  };

  Object.entries(buttons).forEach(([btnId, key]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener("click", () => {
currentStockKey = key;

showScreen("stockTradeScreen");

if (typeof playBgm === "function") {
  playBgm(bgmStock);
}

initStockTrade();
    });
  });

const backBtn = document.getElementById("backToStockMenu");

if (backBtn) {
  backBtn.addEventListener("click", () => {

    if (typeof playBgm === "function") {
      playBgm(bgmMenu);
    }

    showScreen("stockScreen");

  });
}
});

function initStockTrade() {
  const root = document.getElementById("stockTradeRoot");
  const cfg = stockConfigs[currentStockKey];

  root.innerHTML = `
    <div class="stock-trade-game">
      <img src="${cfg.bg}" class="stock-bg" alt="">

      <div class="money-hud stock-money-hud">
  <div>
    目標資金：
    <span id="targetMoneyStockTrade">
      10,000,000
    </span>
    クレジット
  </div>

  <div>
    現在資産：
    <span id="currentMoneyStockTrade">
      1,000,000
    </span>
    クレジット
  </div>
</div>

      <div class="stock-ui">
        <h1>${cfg.name}</h1>

        <div class="stock-chart-box">
          <canvas id="stockChart" width="800" height="360"></canvas>
        </div>

        <div class="stock-info">
          <div>現在株価：<b id="stockPrice"></b></div>
          <div>保有株数：<b id="stockShares"></b></div>
          <div>平均取得：<b id="stockAvg"></b></div>
          <div>評価損益：<b id="stockProfit"></b></div>
        </div>

        <div class="stock-order">
          <label>購入株数</label>
          <select id="stockAmount">
            <option value="100">100株</option>
            <option value="200">200株</option>
            <option value="500">500株</option>
            <option value="1000">1000株</option>
          </select>

          <button id="stockBuyBtn">買う</button>
          <button id="stockSellBtn">売る</button>
          <button id="stockStartBtn">市場開始</button>
          <button id="stockPauseBtn">一時停止</button>
        </div>

        <div id="stockNewsBox" class="stock-news">
          ニュースはまだありません。
        </div>
      </div>

      <img id="stockYuukaImg"
           src="images/yuukastock1.png"
           class="stock-yuuka"
           alt="">

      <div id="stockSpeech" 
        class="stock-speech">

        <div id="stockHoldings"
     class="stock-holdings">
</div>

        <b>ユウカ</b><br>
        ${cfg.name}の株価を確認しましょう。
      </div>
    </div>
  `;

  startStockLogic();
}

function startStockLogic() {
  const cfg = stockConfigs[currentStockKey];
  const state = stockState[currentStockKey];

  const canvas = document.getElementById("stockChart");
  const ctx = canvas.getContext("2d");

  let running = false;
  let timer = null;
  let eventBoost = 0;
  let eventTtl = 0;

  if (state.candles.length === 0) {
    for (let i = 0; i < 60; i++) {
      addStockCandle();
    }
  }

  function addStockCandle() {
    const open = state.price;

    let move =
      (Math.random() - 0.5) * cfg.volatility +
      cfg.trend / 1000;

    if (eventTtl > 0) {
      move += eventBoost;
      eventTtl--;
    }

    state.price = Math.max(
      20,
      state.price * (1 + move)
    );

    const close = state.price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    state.candles.push({ open, high, low, close });

    if (state.candles.length > 60) {
      state.candles.shift();
    }
  }

  function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 36;
    const highs = state.candles.map(c => c.high);
    const lows = state.candles.map(c => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {
      const y = pad + i * (canvas.height - pad * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(canvas.width - pad, y);
      ctx.stroke();
    }

    const yscale = price =>
      canvas.height - pad -
      (price - min) / (max - min || 1) *
      (canvas.height - pad * 2);

    const step = (canvas.width - pad * 2) / state.candles.length;
    const w = Math.max(5, step - 4);

    state.candles.forEach((c, i) => {
      const x = pad + i * step + step / 2;

      const yOpen = yscale(c.open);
      const yClose = yscale(c.close);
      const yHigh = yscale(c.high);
      const yLow = yscale(c.low);

      const up = c.close >= c.open;

      ctx.strokeStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      ctx.fillStyle = up ? "#38bdf8" : "#f472b6";

      ctx.fillRect(
        x - w / 2,
        Math.min(yOpen, yClose),
        w,
        Math.max(2, Math.abs(yClose - yOpen))
      );
    });

    ctx.fillStyle = "#e0f2fe";
    ctx.font = "16px system-ui";
    ctx.fillText(
      `${cfg.name}　現在株価 ${Math.round(state.price).toLocaleString()} クレジット`,
      pad,
      24
    );
  }

  function updateUI() {
    const currentValue = state.shares * state.price;
    const cost = state.shares * state.avgPrice;
    const profit = currentValue - cost;

    document.getElementById("stockPrice").textContent =
      Math.round(state.price).toLocaleString();

    document.getElementById("stockShares").textContent =
      state.shares.toLocaleString() + "株";

    document.getElementById("stockAvg").textContent =
      state.avgPrice
        ? Math.round(state.avgPrice).toLocaleString()
        : "-";

    const profitEl = document.getElementById("stockProfit");
    profitEl.textContent =
      (profit >= 0 ? "+" : "") +
      Math.round(profit).toLocaleString();

    profitEl.className = profit >= 0 ? "green" : "red";

    updateStockYuuka(profit);

    updateHoldings();
  }

  function updateStockYuuka(profit) {
    const img = document.getElementById("stockYuukaImg");
    const speech = document.getElementById("stockSpeech");

    if (gameState.currentMoney <= 500000) {
      img.src = "images/yuukastock4.png";
      speech.innerHTML =
        `<b>ユウカ</b><br>資産がかなり減っています……。ここは慎重にいきましょう。`;
    } else if (profit > 100000) {
      img.src = "images/yuukastock3.png";
      speech.innerHTML =
        `<b>ユウカ</b><br>素晴らしい含み益です。この調子です！`;
    } else if (profit < 0) {
      img.src = "images/yuukastock2.png";
      speech.innerHTML =
        `<b>ユウカ</b><br>含み損が出ています。焦って売買しないでください。`;
    } else {
      img.src = "images/yuukastock1.png";
      speech.innerHTML =
        `<b>ユウカ</b><br>${cfg.name}の値動きを確認しましょう。`;
    }
  }

  function buyStock() {
    const amount = Number(document.getElementById("stockAmount").value);
    const cost = Math.round(state.price * amount);

    if (gameState.currentMoney < cost) {
      alert("資金が足りません。");
      return;
    }

    const oldCost = state.avgPrice * state.shares;
    const newCost = oldCost + cost;

    state.shares += amount;
    state.avgPrice = newCost / state.shares;

    setCurrentMoney(gameState.currentMoney - cost);
    updateUI();
  }

function sellStock() {
  const amount = Number(document.getElementById("stockAmount").value);

  if (state.shares < amount) {
    alert("保有株数が足りません。");
    return;
  }

  const income = Math.round(state.price * amount);
  const costBasis = Math.round(state.avgPrice * amount);
  const realizedProfit = income - costBasis;

  state.shares -= amount;

  if (state.shares === 0) {
    state.avgPrice = 0;
  }

  setCurrentMoney(gameState.currentMoney + income);

  if (typeof playSe === "function") {
    if (realizedProfit >= 0) {
      playSe(seToku);
    } else {
      playSe(seSonn);
    }
  }

  updateUI();
}

  function triggerNews() {
    const list = stockNews[currentStockKey];
    const news = list[Math.floor(Math.random() * list.length)];

    document.getElementById("stockNewsBox").textContent =
      "ニュース：" + news[0];

    eventBoost = news[1] / 8;
    eventTtl = 8;
  }

  function tick() {
    if (!running) return;

    addStockCandle();

    if (Math.random() < 0.12 && eventTtl <= 0) {
      triggerNews();
    }

    drawChart();
    updateUI();
  }

  document.getElementById("stockBuyBtn").onclick = buyStock;
  document.getElementById("stockSellBtn").onclick = sellStock;

  document.getElementById("stockStartBtn").onclick = () => {
    running = true;
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 700);
  };

  document.getElementById("stockPauseBtn").onclick = () => {
    running = false;
  };

  drawChart();
  updateUI();
}

function updateHoldings() {

  const box =
    document.getElementById("stockHoldings");

  if (!box) return;

  let html =
    "<b>保有銘柄一覧</b><br><br>";

  let hasStock = false;

  Object.entries(stockState)
    .forEach(([key, state]) => {

      if (state.shares > 0) {

        hasStock = true;

        html +=
          `${stockConfigs[key].name}
           ${state.shares.toLocaleString()}株<br>`;
      }
    });

  if (!hasStock) {
    html += "保有銘柄はありません";
  }

  box.innerHTML = html;
}
