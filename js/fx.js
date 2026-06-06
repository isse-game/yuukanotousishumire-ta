// =====================
// FX画面
// =====================

let fxInitialized = false;

function initFXScreen() {
  if (fxInitialized) return;
  fxInitialized = true;

  const root = document.getElementById("fxGameRoot");

  root.innerHTML = `
    <div class="fx-game">
      <header>
        <h1>青輝石為替シミュレーター</h1>
      </header>

      <div class="fx-wrap">
        <section class="fx-panel">
          <h2>クレジット / 青輝石 市場</h2>

          <div class="chart-box">
            <canvas id="chart" width="900" height="390"></canvas>
          </div>

          <div class="stat">
            <div><span>残高</span><b id="balance">1,000,000</b></div>
            <div><span>評価額</span><b id="equity">1,000,000</b></div>
            <div><span>含み損益</span><b id="upl">0</b></div>
            <div><span>現在レート</span><b id="lastPrice">120.00</b></div>
          </div>

          <div class="trade-grid">
            <div class="fx-panel" style="box-shadow:none">
<h2>新規注文</h2>

<div class="order-compact">
  <div class="full">
    <label>取引数量（青輝石）</label>
    <input id="amount" type="number" value="100" min="0" step="10">
  </div>

  <button class="amountBtn" data-add="10">+10</button>
  <button class="amountBtn" data-add="100">+100</button>

  <button class="amountBtn" data-add="1000">+1000</button>
  <button id="clearAmountBtn">クリア</button>

  <div>
    <label>レバレッジ</label>
    <select id="leverage">
      <option value="1">1倍</option>
      <option value="5">5倍</option>
      <option value="10" selected>10倍</option>
      <option value="20">20倍</option>
    </select>
  </div>

  <div>
    <label>必要証拠金</label>
    <input id="requiredMargin" type="text" value="-" disabled>
  </div>

  <div>
    <label>ゲーム速度</label>
    <select id="speed">
      <option value="800">ゆっくり</option>
      <option value="450" selected>ふつう</option>
      <option value="220">はやい</option>
    </select>
  </div>

  <div>
    <label>現在レート</label>
    <input id="mkt" type="text" value="-" disabled>
  </div>

 </div>

            </div>

            <div class="fx-panel position-panel" style="box-shadow:none">
              <h2>保有ポジション</h2>

              <div class="position-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>方向</th>
                      <th>数量</th>
                      <th>レバ</th>
                      <th>建値</th>
                      <th>現在値</th>
                      <th>証拠金</th>
                      <th>損益</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="posBody"></tbody>
                </table>
              </div>

              <div id="newsBox" class="news">
                ニュースはまだありません。市場開始後、ランダムイベントが自動発生します。
              </div>
            </div>
          </div>
        </section>

        <section class="character-area">
          <img src="images/haikei.png" class="character-bg" alt="">
          <img id="yuukaImg" src="images/yuukatousi1.png" class="character-yuuka" alt="">
          <img src="images/pasokon.png" class="character-pc" alt="">

          <div class="speech" id="speechBox">
            <b>ユウカ</b><br>
            市場を確認しましょう。無理な取引は禁物です。
          </div>
        </section>
       
        <div class="floating-trade-controls">
  <button id="buyBtn" class="btn-buy">買い</button>
  <button id="sellBtn" class="btn-sell">売り</button>

  <button id="startBtn" class="btn-main">スタート</button>
  <button id="pauseBtn" class="btn-gray">一時停止</button>

  <button id="closeAllBtn" class="btn-close">全決済</button>
  <button id="resetBtn" class="btn-gray">リセット</button>
</div>
      </div>
    </div>
  `;

  startFXLogic();
}

function enableFloatingControlsDrag() {
  const box = document.querySelector(".floating-trade-controls");
  if (!box) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  box.addEventListener("mousedown", e => {
    if (e.target.tagName === "BUTTON") return;

    isDragging = true;

    const rect = box.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    box.style.right = "auto";
    box.style.bottom = "auto";
    box.style.left = rect.left + "px";
    box.style.top = rect.top + "px";
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;

    box.style.left = e.clientX - offsetX + "px";
    box.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function startFXLogic() {
  const el = id => document.getElementById(id);
  const fmt = n => Math.round(n).toLocaleString();

  const canvas = el("chart");
  const ctx = canvas.getContext("2d");

  const MAX_CANDLES = 80;
  const CANDLE_TF_MIN = 15;
  const MINUTE_PER_TICK = 5;

  let price = 120;
  let balance = 1_000_000;
  let running = false;
  let timer = null;
  let volAnnual = 0.10;
  let spread = 0.05;
  let nextEventCount = 18;
  let eventCooldown = 0;

  const candles = [];
  const positions = [];

  let currentEvent = {
    ttl: 0,
    bias: 0,
    volBoost: 0,
    text: ""
  };

  const randn = (() => {
    let spare = null;
    return () => {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return v;
      }

      let u = 0, v = 0, s = 0;

      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
      } while (s === 0 || s >= 1);

      const m = Math.sqrt(-2 * Math.log(s) / s);
      spare = v * m;

      return u * m;
    };
  })();

  function setNextEventCount() {
    nextEventCount = Math.floor(Math.random() * 14) + 18;
  }

  function stepPrice(dtMin) {
    const minutesPerYear = 365 * 24 * 60;
    const dt = dtMin / minutesPerYear;

    let sigma = volAnnual;
    let bias = 0;

    if (currentEvent.ttl > 0) {
      sigma += currentEvent.volBoost;
      bias = currentEvent.bias;
      currentEvent.ttl -= dtMin;
    }

    const dlog =
      -0.5 * sigma * sigma * dt +
      sigma * Math.sqrt(dt) * randn() +
      bias * Math.sqrt(dt);

    price = Math.max(1, price * Math.exp(dlog));
  }

  function makeCandle() {
    const open = price;

    for (let i = 0; i < CANDLE_TF_MIN / MINUTE_PER_TICK; i++) {
      stepPrice(MINUTE_PER_TICK);
    }

    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.002);
    const low = Math.min(open, close) * (1 - Math.random() * 0.002);

    return { open, high, low, close };
  }

  function generateInitialCandles() {
    candles.length = 0;

    for (let i = 0; i < MAX_CANDLES; i++) {
      candles.push(makeCandle());
    }
  }

  function addCandle() {
    candles.push(makeCandle());

    if (candles.length > MAX_CANDLES) {
      candles.shift();
    }
  }

  function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 34;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const y = pad + i * (canvas.height - pad * 2) / 5;
      ctx.moveTo(pad, y);
      ctx.lineTo(canvas.width - pad, y);
    }

    for (let i = 0; i < 10; i++) {
      const x = pad + i * (canvas.width - pad * 2) / 9;
      ctx.moveTo(x, pad);
      ctx.lineTo(x, canvas.height - pad);
    }

    ctx.stroke();

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);

    const yscale = y => {
      return canvas.height - pad - (y - min) / (max - min || 1) * (canvas.height - pad * 2);
    };

    const area = canvas.width - pad * 2;
    const step = area / MAX_CANDLES;
    const w = Math.max(4, step - 3);

    candles.forEach((c, i) => {
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

      const top = Math.min(yOpen, yClose);
      const h = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillRect(x - w / 2, top, w, h);
    });

    const last = candles[candles.length - 1];

    ctx.fillStyle = "#e0f2fe";
    ctx.font = "13px system-ui";
    ctx.fillText(`CREDIT / PYROXENE　15分足　${last.close.toFixed(2)}`, pad, 22);

    if (currentEvent.ttl > 0) {
      ctx.fillStyle = "#fde68a";
      ctx.fillText("NEWS: " + currentEvent.text, pad, 42);
    }
  }

  function getPrice(side, exit = false) {
    if (side === 1) {
      return exit ? price - spread : price + spread;
    }

    return exit ? price + spread : price - spread;
  }

  function calcPL(p) {
    const now = getPrice(p.side, true);
    return (now - p.entry) * p.amount * p.side * p.leverage;
  }

  function updateRequiredMargin() {
    const amount = Math.max(0, Number(el("amount").value));
    const leverage = Number(el("leverage").value) || 1;
    const entry = price + spread;
    const margin = entry * amount / leverage;

    const marginEl = el("requiredMargin");

    if (marginEl) {
      marginEl.value = fmt(margin) + " クレジット";
    }
  }

  function openPosition(side) {
    const amount = Math.max(1, Number(el("amount").value));
    const entry = getPrice(side, false);
    const leverage = Number(el("leverage").value) || 1;
    const margin = entry * amount / leverage;

    if (margin > balance) {
      flash("証拠金が足りません");
      return;
    }

    balance -= margin;

    positions.push({
      id: crypto.randomUUID(),
      side,
      amount,
      entry,
      leverage,
      margin
    });

    updateUI();
  }

  function closePosition(id) {
    const index = positions.findIndex(p => p.id === id);
    if (index < 0) return;

    const p = positions[index];
    const pl = calcPL(p);

    balance += p.margin + pl;
    positions.splice(index, 1);

    flash(`決済：${pl >= 0 ? "+" : ""}${fmt(pl)} クレジット`);
    updateUI();
  }

  function closeAll() {
    positions.map(p => p.id).forEach(closePosition);
  }

  function updateUI() {
    let upl = 0;
    let equity = balance;

    positions.forEach(p => {
      const pl = calcPL(p);
      upl += pl;
      equity += p.margin + pl;
    });

    el("balance").textContent = fmt(balance);
    el("equity").textContent = fmt(equity);
    el("upl").textContent = (upl >= 0 ? "+" : "") + fmt(upl);
    el("upl").className = upl >= 0 ? "green" : "red";
    el("lastPrice").textContent = price.toFixed(2);
    el("mkt").value = price.toFixed(2);

    if (typeof setCurrentMoney === "function") {
      setCurrentMoney(equity);
    }

    renderPositions();
    updateRequiredMargin();
    updateYuukaFace(equity, upl);
  }

  function updateYuukaFace(equity, upl) {
    const img = el("yuukaImg");
    const speech = el("speechBox");

    if (equity <= 700000) {
      img.src = "images/yuukatousi3.png";
      speech.innerHTML = "<b>ユウカ</b><br>資産がかなり減っています……！ここは無理せず立て直しましょう。";
    } else if (equity >= 1300000) {
      img.src = "images/yuukatousi5.png";
      speech.innerHTML = "<b>ユウカ</b><br>素晴らしい成績です。ですが、油断は禁物ですよ。";
    } else if (upl < 0) {
      img.src = "images/yuukatousi2.png";
      speech.innerHTML = "<b>ユウカ</b><br>含み損が出ています。焦らず、状況を確認しましょう。";
    } else if (upl > 0) {
      img.src = "images/yuukatousi4.png";
      speech.innerHTML = "<b>ユウカ</b><br>含み益が出ています。この調子でいきましょう。";
    } else {
      img.src = "images/yuukatousi1.png";
      speech.innerHTML = "<b>ユウカ</b><br>市場を確認しましょう。無理な取引は禁物です。";
    }
  }

  function renderPositions() {
    const body = el("posBody");
    body.innerHTML = "";

    positions.forEach(p => {
      const now = getPrice(p.side, true);
      const pl = calcPL(p);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="${p.side === 1 ? "green" : "red"}">${p.side === 1 ? "買い" : "売り"}</td>
        <td>${p.amount}</td>
        <td>${p.leverage}倍</td>
        <td>${p.entry.toFixed(2)}</td>
        <td>${now.toFixed(2)}</td>
        <td>${fmt(p.margin)}</td>
        <td class="${pl >= 0 ? "green" : "red"}">${pl >= 0 ? "+" : ""}${fmt(pl)}</td>
        <td><button class="btn-gray" data-id="${p.id}" style="padding:6px 10px">決済</button></td>
      `;

      body.appendChild(tr);
    });

    body.querySelectorAll("button").forEach(btn => {
      btn.onclick = e => closePosition(e.currentTarget.dataset.id);
    });
  }

  function triggerRandomEvent() {
    const events = [
      ["限定募集開始！青輝石需要が少し高まっています。", 0.16, 0.025],
      ["連邦生徒会が青輝石配布を発表しました。", -0.16, 0.025],
      ["ミレニアム市場でクレジット不足が意識されています。", 0.10, 0.020],
      ["市場参加者の思惑が交錯しています。", Math.random() < 0.5 ? 0.10 : -0.10, 0.020],
      ["材料不足のなか、短期筋の売買が入っています。", Math.random() < 0.5 ? 0.06 : -0.06, 0.015]
    ];

    const e = events[Math.floor(Math.random() * events.length)];

    currentEvent = {
      ttl: 45,
      text: e[0],
      bias: e[1],
      volBoost: e[2]
    };

    eventCooldown = 10;

    el("newsBox").textContent = "ニュース：" + e[0];
    flash("市場イベント発生");
  }

  function tick() {
    if (!running) return;

    addCandle();

    if (currentEvent.ttl <= 0) {
      currentEvent = { ttl:0, bias:0, volBoost:0, text:"" };

      if (eventCooldown > 0) {
        eventCooldown--;
      } else {
        nextEventCount--;
      }
    }

    if (nextEventCount <= 0 && currentEvent.ttl <= 0 && eventCooldown <= 0) {
      triggerRandomEvent();
      setNextEventCount();
    }

    if (currentEvent.ttl <= 0 && eventCooldown <= 0) {
      el("newsBox").textContent = "次の市場イベントを待機中です。";
    }

    drawChart();
    updateUI();
  }

  function resetGame() {
    running = false;
    price = 120;
    balance = 1_000_000;
    positions.length = 0;
    currentEvent = { ttl:0, bias:0, volBoost:0, text:"" };
    eventCooldown = 0;
    setNextEventCount();

    el("newsBox").textContent =
      "ニュースはまだありません。市場開始後、ランダムイベントが自動発生します。";

    generateInitialCandles();
    drawChart();
    updateUI();
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, Number(el("speed").value));
  }

  function flash(msg) {
    const div = document.createElement("div");

    div.textContent = msg;
    div.style.position = "fixed";
    div.style.right = "14px";
    div.style.bottom = "14px";
    div.style.background = "#ffffff";
    div.style.border = "1px solid #60a5fa";
    div.style.color = "#075985";
    div.style.padding = "10px 14px";
    div.style.borderRadius = "12px";
    div.style.boxShadow = "0 8px 20px rgba(15,23,42,.18)";
    div.style.zIndex = "9999";

    document.body.appendChild(div);

    setTimeout(() => {
      div.style.opacity = "0";
      div.style.transition = "opacity .4s";
      setTimeout(() => div.remove(), 500);
    }, 1600);
  }

  el("buyBtn").onclick = () => openPosition(1);
  el("sellBtn").onclick = () => openPosition(-1);
  el("closeAllBtn").onclick = closeAll;

  el("startBtn").onclick = () => {
    running = true;
    restartTimer();
    flash("市場開始");
  };

  el("pauseBtn").onclick = () => {
    running = false;
    flash("一時停止");
  };

  el("resetBtn").onclick = resetGame;

  el("speed").onchange = () => {
    restartTimer();
  };

  document.querySelectorAll(".amountBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const add = Number(e.currentTarget.dataset.add);
      const amountInput = el("amount");

      amountInput.value = Number(amountInput.value || 0) + add;

      updateRequiredMargin();
    });
  });

  el("clearAmountBtn").onclick = () => {
    el("amount").value = 0;
    updateRequiredMargin();
  };

  el("amount").addEventListener("input", updateRequiredMargin);
  el("leverage").addEventListener("change", updateRequiredMargin);

  enableFloatingControlsDrag();

  resetGame();
}