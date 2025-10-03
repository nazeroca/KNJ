// 画数クイズ専用クラス
class KanjiQuiz {
  constructor() {
    this.kanjiData = [];
    this.hardKanjiData = [];
    this.consecutiveCorrectCount = 0; // QuizSystemから設定される
    this.isHardModeActive = false;
    
    this.loadKanjiData();
  }
  
  // 漢字データ読み込み
  async loadKanjiData() {
    try {
      const response = await fetch('kanji.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.kanjiData = data.kanji;
      this.hardKanjiData = data.hardKanji;
      console.log('漢字データ読み込み完了:', this.kanjiData.length, '個');
      console.log('高難易度漢字データ読み込み完了:', this.hardKanjiData.length, '個');
    } catch (error) {
      console.error('漢字データの読み込みに失敗しました:', error);
      // フォールバック用の最小限のデータ
      this.kanjiData = [
        { "kanji": "十", "strokes": 10 },
        { "kanji": "廿", "strokes": 20 },
        { "kanji": "丗", "strokes": 30 }
      ];
      this.hardKanjiData = [
        { "kanji": "鬱", "strokes": 29 },
        { "kanji": "鑑", "strokes": 23 }
      ];
      console.log('フォールバックデータを使用');
    }
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
        console.log('高難易度色変化開始');
      } else {
        kanjiSquare.classList.add('normal-mode');
        console.log('通常色変化開始');
      }
    }, 50);
  }
  
  // 問題を生成
  async generateQuestion() {
    // データが読み込まれていない場合は待機
    if (this.kanjiData.length === 0 || this.hardKanjiData.length === 0) {
      console.log('漢字データ読み込み待機中...');
      // データ読み込み完了まで待機
      while (this.kanjiData.length === 0 || this.hardKanjiData.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 高難易度出題確率をチェック
    const hardProbability = this.getHardDifficultyProbability();
    const isHardQuestion = Math.random() < hardProbability;
    
    let currentKanji;
    
    // 高難易度問題の場合
    if (isHardQuestion) {
      const randomIndex = Math.floor(Math.random() * this.hardKanjiData.length);
      currentKanji = this.hardKanjiData[randomIndex];
      this.isHardModeActive = true;
      
      // 枠と背景を徐々に赤色に変更
      this.animateColorTransition(true);
      
      console.log('高難易度問題:' + currentKanji.kanji, '画数:', currentKanji.strokes);
    } else {
      // 通常問題
      const randomIndex = Math.floor(Math.random() * this.kanjiData.length);
      currentKanji = this.kanjiData[randomIndex];
      this.isHardModeActive = false;
      
      // 枠と背景を通常のシアン色に戻す
      this.animateColorTransition(false);
      
      console.log('通常問題:' + currentKanji.kanji, '画数:', currentKanji.strokes);
    }
    
    return {
      displayText: currentKanji.kanji,
      correctAnswer: currentKanji.strokes,
      isHardMode: this.isHardModeActive,
      kanji: currentKanji
    };
  }
  
  // 解答結果を処理（連続正解数はQuizSystemで管理）
  handleAnswerResult(isCorrect) {
    // 連続正解数の更新はQuizSystemで行うため、ここでは何もしない
    console.log('漢字クイズ解答結果:', isCorrect ? '正解' : '不正解');
    
    // 高難易度問題の枠と背景を通常色に徐々に復元
    if (this.isHardModeActive) {
      this.animateColorTransition(false);
    }
  }
  
  // クイズタイプを返す
  getQuizType() {
    return 'kanji';
  }
  
  // クイズ名を返す
  getQuizName() {
    return '漢字画数クイズ';
  }
}
