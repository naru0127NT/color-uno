// ==============================
// UNO用 定数・状態
// ==============================

// カードの色
const COLORS = ["red", "yellow", "green", "blue"];

// 山札 / 手札 / 捨て札
let deck = [];
let playerHand = [];
let cpuHand = [];
let discardPile = [];

// ==============================
// デッキ生成・シャッフル
// ==============================

// 構成：
// 1〜3の各4色 = 12枚
// リバース2枚（青, 赤）
// スキップ2枚（黄, 緑）
// → 合計16枚（ワイルドなし）
function createDeck() {
  const cards = [];
  let id = 0;

  // 数字カード 1〜3 × 4色 = 12枚
  COLORS.forEach((color) => {
    for (let num = 1; num <= 3; num++) {
      cards.push({
        id: id++,
        color,
        kind: "number", // "number" | "action"
        value: String(num),
        label: String(num),
      });
    }
  });

  // リバース2枚（緑・黄） ←画像に合わせて変更
  [["green", "reverse"], ["yellow", "reverse"]].forEach(([color, type]) => {
    cards.push({
      id: id++,
      color,
      kind: "action",
      value: type,
      label: "↺",
    });
  });

  // スキップ2枚（青・赤） ←画像に合わせて変更
  [["blue", "skip"], ["red", "skip"]].forEach(([color, type]) => {
    cards.push({
      id: id++,
      color,
      kind: "action",
      value: type,
      label: "⊘",
    });
  });


  return cards;
}

// フィッシャー–イェーツシャッフル
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ==============================
// ゲーム初期化
// ==============================

function initGame() {
  deck = createDeck();
  shuffle(deck);

  // 手札を配る（プレイヤー・CPU 各5枚）
  playerHand = deck.splice(0, 5);
  cpuHand = deck.splice(0, 5);

  // 場に1枚置く
  discardPile = [deck.shift()];

  renderAll();
  setMessage("場のカードと『色』か『数字／記号』が合うカードを出してみよう。");
}

function topDiscard() {
  return discardPile[discardPile.length - 1] || null;
}

// ==============================
// 出せるカードかどうかの判定
// ==============================

function canPlay(card, top) {
  if (!top) return true; // 念のため

  // 色が同じならOK
  if (card.color === top.color) return true;

  // 数字カード同士で数字が同じならOK
  if (card.kind === "number" && top.kind === "number" && card.value === top.value) {
    return true;
  }

  // アクションカード同士で種類が同じならOK（reverse 同士など）
  if (card.kind === "action" && top.kind === "action" && card.value === top.value) {
    return true;
  }

  return false;
}

// ==============================
// アクション：カードを出す・引く
// ==============================

function playCard(cardId) {
  // プレイヤーの手札から探す
  const index = playerHand.findIndex((c) => c.id === cardId);
  if (index === -1) return;

  const card = playerHand[index];
  const top = topDiscard();

  if (!canPlay(card, top)) {
    setMessage("そのカードはルール上は出せません（色か数字／記号が合っていない）。");
    return;
  }

  // 手札から取り除いて捨て札へ
  playerHand.splice(index, 1);
  discardPile.push(card);

  renderAll();

  if (playerHand.length === 0) {
    setMessage("あなたの手札が0枚になりました！色の見え方、どう感じましたか？");
    return;
  }

  setMessage("カードを出しました。CPUのターンです。");
  cpuTurn();
}

function drawCard() {
  if (deck.length === 0) {
    setMessage("山札がありません。リセットしてやり直すか、見え方を観察してみてください。");
    return;
  }

  const card = deck.shift();
  playerHand.push(card);
  renderAll();

  const top = topDiscard();
  if (canPlay(card, top)) {
    setMessage("1枚引きました。このカードは出せます。色の見え方を確認してからクリックしてみてね。");
  } else {
    setMessage("1枚引きましたが、今の場とは合いません。さらに引くか、他のカードを探してみてね。");
  }
}

// ==============================
// CPUターン（とても優しいAI）
// ==============================

function cpuTurn() {
  const top = topDiscard();

  // 出せるカードを探す（最初に見つかった1枚を出す）
  let playableIndex = -1;
  for (let i = 0; i < cpuHand.length; i++) {
    if (canPlay(cpuHand[i], top)) {
      playableIndex = i;
      break;
    }
  }

  if (playableIndex >= 0) {
    // そのカードを場に出す
    const card = cpuHand.splice(playableIndex, 1)[0];
    discardPile.push(card);
    renderAll();

    if (cpuHand.length === 0) {
      setMessage("CPUの手札が0枚になりました。CPUの勝ち！色の見え方はどうでしたか？");
      return;
    }

    setMessage("CPUがカードを1枚出しました。あなたのターンです。");
    return;
  }

  // 出せるカードがない場合、1枚引く
  if (deck.length > 0) {
    const drawn = deck.shift();
    cpuHand.push(drawn);
    renderAll();

    const newTop = topDiscard();

    // 引いたカードが出せるなら、そのまま出す（おまけルール）
    if (canPlay(drawn, newTop)) {
      // さっき push したカードを取り出して出す
      const lastIndex = cpuHand.length - 1;
      const playCardObj = cpuHand.splice(lastIndex, 1)[0];
      discardPile.push(playCardObj);
      renderAll();

      if (cpuHand.length === 0) {
        setMessage("CPUの手札が0枚になりました。CPUの勝ち！色の見え方はどうでしたか？");
        return;
      }

      setMessage("CPUは1枚引いて、そのカードをすぐに出しました。あなたのターンです。");
    } else {
      setMessage("CPUは1枚引きましたが出せませんでした。あなたのターンです。");
    }
  } else {
    // 山札もなくCPUも出せない
    setMessage("CPUも出せず、山札もありません。ゲーム終了です。");
  }
}

// ==============================
// メッセージ表示
// ==============================

function setMessage(msg) {
  const el = document.getElementById("message");
  if (el) el.textContent = msg;
}

// ==============================
// 描画関連
// ==============================

function renderAll() {
  renderDiscard();
  renderDeckInfo();
  renderHand();
  renderCpuInfo();
}

function renderDiscard() {
  const container = document.getElementById("discard");
  container.innerHTML = "";

  const top = topDiscard();
  if (!top) return;

  const cardEl = createCardElement(top, false);
  container.appendChild(cardEl);
}

function renderDeckInfo() {
  const countEl = document.getElementById("deckCount");
  if (countEl) countEl.textContent = String(deck.length);
}

function renderHand() {
  const handEl = document.getElementById("hand");
  handEl.innerHTML = "";

  const top = topDiscard();

  playerHand.forEach((card) => {
    const playable = canPlay(card, top);
    const cardEl = createCardElement(card, playable);
    if (!playable) {
      cardEl.classList.add("unplayable");
    }
    handEl.appendChild(cardEl);
  });
}

function renderCpuInfo() {
  const cpuCountEl = document.getElementById("cpuCount");
  if (cpuCountEl) {
    cpuCountEl.textContent = `${cpuHand.length}枚`;
  }
}

function createCardElement(card, clickable) {
  const div = document.createElement("div");
  div.className = "card";

  // filter.js で定義された themeClass を使って
  // どのフォルダの画像を使うか決める
  let themeFolder = "unfriendly"; // デフォルト

  // themeClass は filter.js で定義されているグローバル変数
  // （まだ設定されていない場合もあるのでチェック）
  if (typeof themeClass !== "undefined" && themeClass) {
    if (themeClass === "theme-unfriendly") {
      themeFolder = "unfriendly";
    } else if (themeClass === "theme-a") {
      themeFolder = "themeA";
    } else if (themeClass === "theme-b") {
      themeFolder = "themeB";
    } else if (themeClass === "theme-c") {
      themeFolder = "themeC";
    } else if (themeClass === "theme-d") {
      themeFolder = "themeD";
    }
  }

  // カードに対応するファイル名を決める
  // 例： red_1.png / blue_skip.png / green_reverse.png
  let fileName = "";

  if (card.kind === "number") {
    // 1,2,3 の数字カード
    fileName = `${card.color}_${card.value}.png`;
  } else if (card.kind === "action") {
    // reverse / skip のカード
    // createDeck の value に "reverse" / "skip" が入っているのでそのまま使う
    fileName = `${card.color}_${card.value}.png`;
  }

  // 背景画像としてカード画像を設定
  div.style.backgroundImage = `url('./images/cards/${themeFolder}/${fileName}')`;
  div.style.backgroundSize = "cover";
  div.style.backgroundPosition = "center";

  // 出せないカードでも見た目は同じにするため、テキストは乗せない
  // （cornerTop/center/cornerBottom は作らない）

  // クリック可能な場合のみイベントを付ける
  if (clickable) {
    div.addEventListener("click", () => playCard(card.id));
  }

  return div;
}

// ==============================
// 初期化
// ==============================

window.addEventListener("DOMContentLoaded", () => {
  const drawBtn = document.getElementById("drawButton");
  const restartBtn = document.getElementById("restartButton");

  if (drawBtn) {
    drawBtn.addEventListener("click", drawCard);
  }
  if (restartBtn) {
    restartBtn.addEventListener("click", initGame);
  }

  // ゲーム開始
  initGame();
});

// ===== カスタムドロップダウン（カードデザイン） =====
(function () {
  const btn = document.getElementById("themeBtn");
  const menu = document.getElementById("themeMenu");
  const select = document.getElementById("cardTheme"); // 隠しselect（あれば）

  if (!btn || !menu) return;

  const open = () => {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", () => {
    if (menu.hidden) open();
    else close();
  });

  // 選択処理
  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".design-item");
    if (!item) return;

    const value = item.dataset.value; // "theme-a" など
    const label = item.textContent.trim();

    // ボタン表示を更新
    // （テキストノード＋spanがある想定。崩れてたら btn.textContent = label; でもOK）
    btn.childNodes[0].textContent = label + " ";

    // ✅ここが重要：filter.js の setTheme を呼ぶ（UNO画像切り替えの本体）
    if (typeof setTheme === "function") {
      setTheme(value); // themeClass更新 + renderAll()までやってくれる
    } else {
      // 万一 setTheme が無い場合の保険（最低限bodyクラスだけ）
      document.body.classList.remove("theme-unfriendly", "theme-a", "theme-b", "theme-c", "theme-d");
      document.body.classList.add(value);

      // 画像更新（uno.js内のrenderAll）
      if (typeof renderAll === "function") renderAll();
    }

    // ✅隠しselectにも同期（保険：他の処理がselect依存でもOKにする）
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    close();
  });

  // 外をクリックしたら閉じる
  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (e.target === btn || btn.contains(e.target) || menu.contains(e.target)) return;
    close();
  });

  // ESCで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();