// 絵文字クイズ専用クラス
class EmojiQuiz {
  constructor() {
    this.emojiList = [
      // 食べ物・飲み物
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒',
      '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞',
      '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩',
      '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆',
      '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱',
      '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡',
      '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬',
      '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕',
      '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸'
    ];
    
    this.displaySequence = [];
    this.correctAnswer = null;
    this.displayTimings = [];
    this.consecutiveCorrectCount = 0; // QuizSystemから設定される
    this.isHardModeActive = false;
  }
  
  // 高難易度出題確率を計算
  getHardDifficultyProbability() {
    if (this.consecutiveCorrectCount <= 0) return 0;      // 0% (初期状態)
    if (this.consecutiveCorrectCount === 1) return 0.20;   // 20%
    if (this.consecutiveCorrectCount === 2) return 0.40;   // 40%
    if (this.consecutiveCorrectCount >= 3) return 0.60;     // 60%以上
  }
  
  // 枠色と背景色を徐々に変更する関数
  animateColorTransition(isHardMode) {
    const kanjiSquare = document.getElementById('kanji-square');
    
    kanjiSquare.classList.remove('normal-mode', 'hard-mode');
    
    setTimeout(() => {
      if (isHardMode) {
        kanjiSquare.classList.add('hard-mode');
        console.log('絵文字クイズ高難易度色変化開始');
      } else {
        kanjiSquare.classList.add('normal-mode');
        console.log('絵文字クイズ通常色変化開始');
      }
    }, 50);
  }
  
  // 問題を生成
  async generateQuestion() {
    // 高難易度出題確率をチェック
    const hardProbability = this.getHardDifficultyProbability();
    const isHardQuestion = Math.random() < hardProbability;
    
    let emojiCount, displayInterval;
    
    if (isHardQuestion) {
      // ハードモード: 11~15個を0.3秒間隔
      emojiCount = Math.floor(Math.random() * 5) + 11; // 11~15
      displayInterval = 300;
      this.isHardModeActive = true;
      console.log('絵文字クイズ高難易度問題');
      
      // 背景を赤くする
      this.animateColorTransition(true);
    } else {
      // 通常モード: 6~10個を0.5秒間隔
      emojiCount = Math.floor(Math.random() * 5) + 6; // 6~10
      displayInterval = 500;
      this.isHardModeActive = false;
      console.log('絵文字クイズ通常問題');
      
      // 背景を通常色に戻す
      this.animateColorTransition(false);
    }
    
    // 重複しないランダムな絵文字を選択
    const shuffledEmojis = [...this.emojiList].sort(() => Math.random() - 0.5);
    this.displaySequence = shuffledEmojis.slice(0, emojiCount);
    this.displayInterval = displayInterval;
    
    // 正解は後で選択肢を生成した後に決定する
    this.correctAnswer = null;
    
    console.log('絵文字クイズ生成:', this.displaySequence);
    console.log('絵文字数:', emojiCount + '個');
    console.log('重複チェック:', new Set(this.displaySequence).size === emojiCount ? 'OK' : 'NG');
    console.log('表示間隔:', displayInterval + 'ms');
    
    return {
      displayText: '', // 絵文字は別途表示するため空文字
      correctAnswer: null, // 後で設定
      displaySequence: this.displaySequence,
      quizType: 'emoji',
      isHardMode: this.isHardModeActive
    };
  }
  
  // 絵文字を順次表示
  async displayEmojis(quizCharacter) {
    this.displayTimings = [];
    
    for (let i = 0; i < this.displaySequence.length; i++) {
      const emoji = this.displaySequence[i];
      const startTime = Date.now();
      
      // 絵文字を表示
      quizCharacter.textContent = emoji;
      
      // 設定された間隔で待機（通常: 500ms, ハード: 300ms）
      await new Promise(resolve => setTimeout(resolve, this.displayInterval));
      
      const endTime = Date.now();
      this.displayTimings.push({
        emoji: emoji,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime
      });
    }
    
    // 最後の絵文字を空白に戻す
    quizCharacter.textContent = '';
    
    console.log('絵文字表示完了:', this.displayTimings);
  }
  
  // 選択肢を生成（表示された絵文字から3つを選択）
  generateChoices() {
    // 表示された絵文字から3つをランダムに選択
    const shuffledSequence = [...this.displaySequence].sort(() => Math.random() - 0.5);
    const choices = shuffledSequence.slice(0, 3);
    
    // 選択肢の中で最も表示順序が遅い（インデックスが大きい）絵文字を正解とする
    let latestIndex = -1;
    let correctEmoji = null;
    
    choices.forEach(emoji => {
      const index = this.displaySequence.indexOf(emoji);
      if (index > latestIndex) {
        latestIndex = index;
        correctEmoji = emoji;
      }
    });
    
    this.correctAnswer = correctEmoji;
    
    console.log('選択肢:', choices);
    console.log('表示順序:', this.displaySequence);
    console.log('正解:', this.correctAnswer, '(表示順序:', latestIndex + 1, '番目)');
    
    return choices;
  }
  
  // 解答結果を処理（連続正解数はQuizSystemで管理）
  handleAnswerResult(isCorrect) {
    // 連続正解数の更新はQuizSystemで行うため、ここでは何もしない
    console.log('絵文字クイズ解答結果:', isCorrect ? '正解' : '不正解');
    
    // 高難易度問題の枠と背景を通常色に徐々に復元
    if (this.isHardModeActive) {
      this.animateColorTransition(false);
    }
  }
  
  // クイズタイプを返す
  getQuizType() {
    return 'emoji';
  }
  
  // クイズ名を返す
  getQuizName() {
    return '絵文字記憶クイズ';
  }
}
