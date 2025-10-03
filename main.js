// 漢字ゲーム＋ノーツゲーム統合版
const gameArea = document.getElementById('game-area');
const hitSound = document.getElementById('hit');
const proSound = document.getElementById('pro');
const correctSound = document.getElementById('correct');
const errorSound = document.getElementById('error');
const optionSound = document.getElementById('option');

// 漢字ゲーム関連要素
const kanjiSquare = document.getElementById('kanji-square');
const kanjiCharacter = document.querySelector('.kanji-character');
const buttonArea = document.getElementById('button-area');
const choicesContainer = document.querySelector('.choices-container');
const choiceButtons = document.querySelectorAll('.choice-button');

// スタート画面関連
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const upperGameArea = document.getElementById('upper-game-area');

// ノーツ間隔のレベル（問題ごとに選択）
const noteIntervals = [
  { interval: 5000, desc: "低速" },   // 3秒間隔
  { interval: 4000, desc: "やや低速" }, // 2.5秒間隔
  { interval: 3000, desc: "中速" },   // 2秒間隔
  { interval: 2500, desc: "やや高速" } // 1.5秒間隔
];

// 現在の間隔とノーツカウンター
let currentInterval = 3000; // 初期値: 低速
let noteCounter = 0;
let isGeneratingNotes = false;

let circles = [];

// ゲーム状態管理
let isGameStarted = false;

// 漢字ゲーム関連変数
let currentKanji = null;
let correctAnswer = null;
let kanjiInterval = null;

// 高難易度システム関連
let consecutiveCorrectCount = 0; // 連続正解数
let isHardModeActive = false;   // 現在高難易度問題中かどうか

// 音声初期化
function initializeAudio() {
  try {
      hitSound.volume = 0.7;
    hitSound.load();
    proSound.volume = 0.7;
    proSound.load();
  } catch (error) {
    console.log('Audio initialization failed');
  }
}

// 漢字データ（JSONから読み込み）
let kanjiData = [];
let hardKanjiData = [];

// 漢字データ読み込み（JSON版）
async function loadKanjiData() {
  try {
    const response = await fetch('kanji.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    kanjiData = data.kanji;
    hardKanjiData = data.hardKanji;
    console.log('漢字データ読み込み完了:', kanjiData.length, '個');
    console.log('高難易度漢字データ読み込み完了:', hardKanjiData.length, '個');
  } catch (error) {
    console.error('漢字データの読み込みに失敗しました:', error);
    // フォールバック用の最小限のデータ
    kanjiData = [
      { "kanji": "一", "strokes": 1 },
      { "kanji": "二", "strokes": 2 },
      { "kanji": "三", "strokes": 3 }
    ];
    hardKanjiData = [
      { "kanji": "鬱", "strokes": 29 },
      { "kanji": "鑑", "strokes": 23 }
    ];
    console.log('フォールバックデータを使用');
  }
}

// 高難易度出題確率を計算
function getHardDifficultyProbability() {
  if (consecutiveCorrectCount <= 0) return 0;      // 0% (初期状態)
  if (consecutiveCorrectCount === 1) return 0.20;   // 20%
  if (consecutiveCorrectCount === 2) return 0.40;   // 40%
  if (consecutiveCorrectCount >= 3) return 0.60;     // 60%以上
}

// 枠色と背景色を徐々に変更する関数
function animateColorTransition(isHardMode) {
  const kanjiSquare = document.getElementById('kanji-square');
  
  // CSSクラスでトランジションを制御
  kanjiSquare.classList.remove('normal-mode', 'hard-mode');
  
  setTimeout(() => {
    if (isHardMode) {
      kanjiSquare.classList.add('hard-mode');
      console.log('高難易度色変化開始');
    } else {
      kanjiSquare.classList.add('normal-mode');
      console.log('通常色変化開始');
    }
  }, 50); // 少し遅延してクラス変更
}

// ランダムな漢字を出す関数
function showRandomKanji() {
  if (kanjiData.length === 0 || hardKanjiData.length === 0) return;
  
  // 高難易度出題確率をチェック
  const hardProbability = getHardDifficultyProbability();
  const isHardQuestion = Math.random() < hardProbability;
  
  // 高難易度問題の場合
  if (isHardQuestion) {
    const randomIndex = Math.floor(Math.random() * hardKanjiData.length);
    currentKanji = hardKanjiData[randomIndex];
    isHardModeActive = true;
    
    // 枠と背景を徐々に赤色に変更
    animateColorTransition(true);
    
    console.log('高難易度問題:' + currentKanji.kanji, '画数:', currentKanji.strokes);
  } else {
    // 通常問題
    const randomIndex = Math.floor(Math.random() * kanjiData.length);
    currentKanji = kanjiData[randomIndex];
    isHardModeActive = false;
    
    // 枠と背景を通常のシアン色に戻す
    animateColorTransition(false);
    
    console.log('通常問題:' + currentKanji.kanji, '画数:', currentKanji.strokes);
  }
  
  // ランダムな漢字を選択
  correctAnswer = currentKanji.strokes;
  
  // pro.mp3を再生
  proSound.currentTime = 0;
  proSound.play().catch(() => {});
  
  // 漢字を角丸正方形に表示
  kanjiCharacter.textContent = currentKanji.kanji;
  
  // ボタンエリアを非表示
  buttonArea.style.display = 'none';
  
  // 1秒で漢字を空白に戻す
  setTimeout(() => {
    kanjiCharacter.textContent = '';
    
    // 10秒後に選択肢を表示してカウントダウン開始
    setTimeout(() => {
      showChoices();
    }, 10000);
    
  }, 1000);
}

// 選択肢を表示する関数
function showChoices() {
  // 選択肢表示音を再生
  if (optionSound.readyState >= 2) {
    optionSound.currentTime = 0;
    optionSound.play().catch(error => {
      console.log('選択肢音再生エラー:', error);
    });
  }
  
  // 正解を基準とした3パターンからランダム選択
  const patterns = [
    { min: correctAnswer - 2, max: correctAnswer },     // n-2, n-1, n
    { min: correctAnswer - 1, max: correctAnswer + 1 },  // n-1, n, n+1
    { min: correctAnswer, max: correctAnswer + 2 }       // n, n+1, n+2
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const options = [];
  
  // 最小値が1未満の場合は調整
  const actualMin = Math.max(1, pattern.min);
  const actualMax = pattern.max + (pattern.min - actualMin); // 差を調整
  
  // 連続した3つの数字を生成
  for (let i = 0; i < 3; i++) {
    options.push(actualMin + i);
  }
  
  // 選択肢をシャッフル
  options.sort(() => Math.random() - 0.5);
  
  // ボタンに選択肢を設定
  choiceButtons.forEach((button, index) => {
    button.textContent = options[index];
    button.dataset.value = options[index];
  });
  
  // ボタンエリア全体を表示
  buttonArea.style.display = 'flex';
  
  // 5秒カウントダウン開始（四角形内表示）
  startCountdown();
}

// 連続ノーツ生成開始
let currentNotesInterval = null;

function startContinuousNotes() {
  // 前のノーツ生成を確実に停止
  stopContinuousNotes();
  
  isGeneratingNotes = true;
  noteCounter = 0;
  console.log('連続ノーツ生成開始:', currentInterval + 'ms間隔');
  
  currentNotesInterval = setInterval(() => {
    if (isGeneratingNotes) {
      spawnCircle();
      noteCounter++;
    } else {
      clearInterval(currentNotesInterval);
      currentNotesInterval = null;
    }
  }, currentInterval);
}

// ノーツ生成を停止
function stopContinuousNotes() {
  isGeneratingNotes = false;
  if (currentNotesInterval) {
    clearInterval(currentNotesInterval);
    currentNotesInterval = null;
  }
  console.log('連続ノーツ生成停止');
}

// カウントダウン表示処理（漢字要素を使用）
let countdownTimer = null;
function startCountdown() {
  let secondsLeft = 5;
  
  // 漢字要素にカウントダウンクラスを追加
  kanjiCharacter.classList.add('countdown');
  
  countdownTimer = setInterval(() => {
    kanjiCharacter.textContent = `${secondsLeft}`;
    secondsLeft--;
    
    if (secondsLeft < 0) {
      clearInterval(countdownTimer);
      kanjiCharacter.classList.remove('countdown');
      kanjiCharacter.textContent = '';
      // 時間切れ - 不正解扱い
      handleAnswerResult(false);
    }
  }, 1000);
}

// 解答結果処理（統一）
function handleAnswerResult(isCorrect) {
  // カウントダウンを停止
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // ノーツ生成を停止
  stopContinuousNotes();
  
  // ボタンエリア全体を隠す
  buttonArea.style.display = 'none';
  
  // 漢字要素からカウントダウンクラスをクリアし、空白に
  kanjiCharacter.classList.remove('countdown');
  kanjiCharacter.textContent = '';
  
  // 連続正解数を更新
  if (isCorrect) {
    consecutiveCorrectCount++;
    console.log('連続正解数:', consecutiveCorrectCount, ', 高難易度確率:', getHardDifficultyProbability() * 100 + '%');
  } else {
    consecutiveCorrectCount = 0; // 不正解でリセット
    console.log('不正解 - 連続正解数リセット');
  }
  
  if (isCorrect) {
    // 正解 - ノーツ生成継続
    console.log('正解！ ノーツ生成継続');
    
    // 正解音を再生
    if (correctSound.readyState >= 2) {
      correctSound.currentTime = 0;
      correctSound.play().catch(error => {
        console.log('正解音再生エラー:', error);
      });
    }
    
    // 新しい速度でノーツ生成を再開
    const randomSpeed = noteIntervals[Math.floor(Math.random() * noteIntervals.length)];
    currentInterval = randomSpeed.interval;
    console.log('新しいノーツ速度:', randomSpeed.desc, `(${currentInterval}ms間隔)`);
    startContinuousNotes();
    
  } else {
    // 不正解 - 現在のノーツを即座にクリアしてから罰則パターン実行
    console.log('不正解... ノーツクリア中...');
    
    // 不正解音を再生
    if (errorSound.readyState >= 2) {
      errorSound.currentTime = 0;
      errorSound.play().catch(error => {
        console.log('不正解音再生エラー:', error);
      });
    }
    
    circles.forEach(circle => {
      if (circle.parentNode) {
        circle.parentNode.removeChild(circle);
      }
    });
    circles = [];
    setTimeout(() => {
      executePenaltyPattern();
    }, 10); // ちょっと待ってから罰則パターン開始
    return; // 罰則パターンで次の問題を開始するのでここで終了
  }
  
  // 再度ランダムなタイミングで次を表示
      setTimeout(() => {
    showRandomKanji();
  }, Math.random() * 15000 + 5000); // 5-20秒後
}

// 選択肢のイベントリスナーを設定
choiceButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    // 高難易度問題の枠と背景を通常色に徐々に復元
    if (isHardModeActive) {
      animateColorTransition(false);
    }
    
    const selectedValue = parseInt(e.target.dataset.value);
    const isCorrect = (selectedValue === correctAnswer);
    handleAnswerResult(isCorrect);
  });
});

// 罰則パターン実行
function executePenaltyPattern() {
  console.log('罰則パターン開始 - 間隔: 700ms');
  
  // 現在のノーツをクリア
  circles.forEach(circle => {
    if (circle.parentNode) {
      circle.parentNode.removeChild(circle);
    }
  });
  circles = [];
  
  // 短時間で赤ノーツを20個生成
  let penaltyCount = 0;
  const penaltyInterval = setInterval(() => {
    spawnCircle(true); // 赤色でノーツ生成
    penaltyCount++;
    
    if (penaltyCount >= 20) {
      clearInterval(penaltyInterval);
      
      // ノーツがすべて画面外に出たかチェック
      const checkEnd = () => {
        if (circles.length === 0) {
          // 罰則パターン完了 - 新しい速度でノーツ生成再開
          console.log('罰則パターン完了 - ノーツ生成再開');
          
          // 新しい速度を選択
          const randomSpeed = noteIntervals[Math.floor(Math.random() * noteIntervals.length)];
          currentInterval = randomSpeed.interval;
          console.log('罰則後の新しいノーツ速度:', randomSpeed.desc, `(${currentInterval}ms間隔)`);
          
          // ノーツ生成を再開
          startContinuousNotes();
          
          setTimeout(() => {
            showRandomKanji(); // 次の問題を開始
          }, Math.random() * 8000 + 5000); // 5-13秒後に次の問題
    } else {
          setTimeout(checkEnd, 1000);
        }
      };
      setTimeout(checkEnd, 500);
    }
  }, 700);
}


// 等速ノーツ生成関数
function spawnCircle(isPunishment = false) {
  const circle = document.createElement('div');
  circle.classList.add('circle');
  
  // 赤ノーツの場合は美しいグラデーション
  if (isPunishment) {
    circle.style.background = 'radial-gradient(circle, #FF6666 0%, #FF3333 30%, #CC1111 70%, #881111 100%)';
    circle.style.borderColor = '#FF6666';
    circle.style.boxShadow = '0 0 60px rgba(255, 102, 102, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.3)';
  }
  // 通常ノーツ（青ノーツ）はCSSの設定を使用
  
  gameArea.appendChild(circle);
  circles.push(circle);
  
  const startTime = performance.now();
  const fallDuration = 3000; // 3秒で横切る

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = elapsed / fallDuration;
    
    if (progress < 1) {
      const startX = gameArea.clientWidth;
      const endX = -window.innerWidth * 0.133;
      const posX = startX + (endX - startX) * progress;
      circle.style.left = posX + 'px';
      
      // 判定ライン（20%位置）
      const judgeX = gameArea.clientWidth * 0.2;
      const center = posX + (window.innerWidth * 0.0665);
      
      // 判定ラインでヒット
      if (!circle.played && center <= judgeX && circle.parentNode) {
        if (hitSound.readyState >= 2) {
          hitSound.currentTime = 0;
          hitSound.play().catch(error => {
            // 音声再生エラーは無視
          });
        }
        circle.played = true;
        circle.remove();
        circles = circles.filter(c => c !== circle);
      return;
    }
      requestAnimationFrame(animate);
    } else {
      circle.remove();
      circles = circles.filter(c => c !== circle);
    }
  }
  requestAnimationFrame(animate);
}

// スタートボタンイベントリスナー
startButton.addEventListener('click', () => {
  if (isGameStarted) return;
  
  isGameStarted = true;
  console.log('ゲーム開始！');
  
  // スタート画面を非表示
  startScreen.style.display = 'none';
  
  // 直後にノーツを開始（初期速度）
  currentInterval = 3000; // 初期速度
  startContinuousNotes();
  
  // 初回の漢字ゲームを開始
  setTimeout(() => {
    showRandomKanji();
  }, Math.random() * 15000 + 5000); // 5-20秒後に漢字を開始
});

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', async () => {
  initializeAudio();
  
  // 漢字データを読み込み
  await loadKanjiData();
  
  console.log('システム初期化完了。スタートボタンを押してゲームを開始してください。');
});

// ユーザーの最初のクリック時に音声を有効化
document.addEventListener('click', function enableAudioOnFirstClick() {
  initializeAudio();
  document.removeEventListener('click', enableAudioOnFirstClick);
}, { once: true });