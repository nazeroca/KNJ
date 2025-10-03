// 汎用クイズゲーム＋ノーツゲーム統合版
// スタート画面関連
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const upperGameArea = document.getElementById('upper-game-area');

// ゲーム状態管理
let isGameStarted = false;
let quizSystem = null;

// スタートボタンイベントリスナー
startButton.addEventListener('click', () => {
  if (isGameStarted) return;
  
  isGameStarted = true;
  console.log('ゲーム開始！');
  
  // スタート画面を非表示
  startScreen.style.display = 'none';
  
  // クイズシステムを初期化してランダムクイズを開始
  quizSystem = new QuizSystem();
  quizSystem.startQuiz(); // 引数なしでランダムクイズ開始
});

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('システム初期化完了。スタートボタンを押してゲームを開始してください。');
});

// ユーザーの最初のクリック時に音声を有効化
document.addEventListener('click', function enableAudioOnFirstClick() {
  document.removeEventListener('click', enableAudioOnFirstClick);
}, { once: true });
