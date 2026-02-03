// ==============================
// 色覚フィルタ + カードテーマ制御
// ==============================

// none / protan / deutan / tritan
let currentType = 'none';

// 1:軽度, 2:中度, 3:重度
let severity = 3;

// body に付けるクラス
// 例：filterClass = "protan-mid"
let filterClass = "";

// カードデザイン用クラス
// 例：themeClass = "theme-a"
// トップページにはデザイン選択がないので、初期値は空にしておく
let themeClass = "";

// 強さレベルから名前に変換（light/mid/strong）
function getSeverityName(level) {
  if (level === 1) return "light";
  if (level === 2) return "mid";
  return "strong";
}

// body の class をまとめて反映する
function applyBodyClasses() {
  // 空文字は除外して、半角スペースで結合
  const classes = [filterClass, themeClass].filter(Boolean).join(" ");
  document.body.className = classes;
}

// currentType + severity から filterClass を更新
function updateFilterClass() {
  if (currentType === "none") {
    filterClass = "";
  } else {
    const levelName = getSeverityName(severity); // light/mid/strong
    filterClass = `${currentType}-${levelName}`; // 例: "protan-mid"
  }
  applyBodyClasses();
}

// ボタンから呼ばれる：フィルタタイプ切り替え
function setFilter(type) {
  currentType = type; // "none" / "protan" / "deutan" / "tritan"
  updateFilterClass();
}

// スライダーから呼ばれる：強さ変更
function setSeverity(level) {
  severity = level;

  const label = document.getElementById("severity-label");
  if (label) {
    if (level === 1) {
      label.textContent = "軽度";
    } else if (level === 2) {
      label.textContent = "中度";
    } else {
      label.textContent = "重度";
    }
  }

  updateFilterClass();
}

// UNOページ用：カードデザイン選択
function setTheme(theme) {
  themeClass = theme; // 例: "theme-unfriendly" / "theme-a" など
  applyBodyClasses();

  // UNOのカード表示を描き直す（uno.js にある関数）
  if (typeof renderAll === "function") {
    renderAll();
  }
}


// ==============================
// ページ読み込み時の初期化
// ==============================

window.addEventListener("DOMContentLoaded", () => {
  // ▼ フィルタ強さスライダー（index.html と uno.html 両方にある）
  const slider = document.getElementById("severity");
  if (slider) {
    slider.addEventListener("input", () => {
      const value = parseInt(slider.value, 10);
      setSeverity(value);
    });

    // 初期値で一度反映
    setSeverity(parseInt(slider.value, 10));
  }

  // ▼ カードデザインのセレクトボックス（uno.html にだけある）
  const themeSelect = document.getElementById("cardTheme");
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      setTheme(themeSelect.value);
    });

    // ページ表示時に現在の選択値で反映
    setTheme(themeSelect.value);
  }
});

