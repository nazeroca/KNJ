// 計算クイズ専用クラス
class MathQuiz {
  constructor() {
    this.circles = [];
    this.correctAnswer = null;
    this.consecutiveCorrectCount = 0; // QuizSystemから設定される
    this.isHardModeActive = false;
    this.rows = 0;
    this.cols = 0;
    this.removedCircles = []; // ハードモードで削除された★の位置
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
        console.log('計算クイズ高難易度色変化開始');
      } else {
        kanjiSquare.classList.add('normal-mode');
        console.log('計算クイズ通常色変化開始');
      }
    }, 50);
  }
  
  // 問題を生成
  async generateQuestion() {
    // 高難易度出題確率をチェック
    const hardProbability = this.getHardDifficultyProbability();
    const isHardQuestion = Math.random() < hardProbability;
    
    if (isHardQuestion) {
      // ハードモード: 6~12個
      this.rows = Math.floor(Math.random() * 7) + 6; // 6~12行
      this.cols = Math.floor(Math.random() * 7) + 6; // 6~12列
      this.isHardModeActive = true;
      console.log('計算クイズ高難易度問題');
      
      // 背景を赤くする
      this.animateColorTransition(true);
    } else {
      // 通常モード: 6~12個
      this.rows = Math.floor(Math.random() * 7) + 6; // 6~12行
      this.cols = Math.floor(Math.random() * 7) + 6; // 6~12列
      this.isHardModeActive = false;
      console.log('計算クイズ通常問題');
      
      // 背景を通常色に戻す
      this.animateColorTransition(false);
    }
    
    // ハードモードの場合は★をランダムに削除
    if (isHardQuestion) {
      const totalStars = this.rows * this.cols;
      const removeCount = Math.floor(Math.random() * 9) + 1; // 1~9個削除
      this.removedCircles = this.generateRandomRemovals(this.rows, this.cols, removeCount);
      this.correctAnswer = totalStars - removeCount;
      console.log('計算クイズ生成:', this.rows + '行 × ' + this.cols + '列 = ' + totalStars + '個 - ' + removeCount + '個 = ' + this.correctAnswer + '個');
    } else {
      this.removedCircles = [];
      this.correctAnswer = this.rows * this.cols;
      console.log('計算クイズ生成:', this.rows + '行 × ' + this.cols + '列 = ' + this.correctAnswer + '個');
    }
    
    return {
      displayText: '', // 〇は別途表示するため空文字
      correctAnswer: this.correctAnswer,
      rows: this.rows,
      cols: this.cols,
      quizType: 'math',
      isHardMode: this.isHardModeActive
    };
  }
  
  // ★を表示
  async displayCircles(quizSquare) {
    // 既存の★をクリア
    this.clearStars();
    
    // 四角のサイズを取得
    const squareRect = quizSquare.getBoundingClientRect();
    const squareWidth = squareRect.width;
    const squareHeight = squareRect.height;
    
    // 余白を考慮（上下左右10%の余白）
    const marginX = squareWidth * 0.1;
    const marginY = squareHeight * 0.1;
    const availableWidth = squareWidth - (marginX * 2);
    const availableHeight = squareHeight - (marginY * 2);
    
    // 各列・行の幅・高さをランダムに決定
    const colWidths = this.generateRandomWidths(this.cols, availableWidth);
    const rowHeights = this.generateRandomHeights(this.rows, availableHeight);
    
    // ★を配置
    let currentY = marginY;
    for (let row = 0; row < this.rows; row++) {
      let currentX = marginX;
      for (let col = 0; col < this.cols; col++) {
        // ハードモードで削除される位置かチェック
        const shouldRemove = this.removedCircles.some(pos => pos.row === row && pos.col === col);
        
        if (!shouldRemove) {
          const star = document.createElement('div');
          star.className = 'math-star';
          star.style.position = 'absolute';
          star.style.left = (currentX + colWidths[col] / 2 - 30) + 'px'; // 30pxは星の半径
          star.style.top = (currentY + rowHeights[row] / 2 - 30) + 'px';
          star.style.width = '60px';
          star.style.height = '60px';
          star.style.fontSize = '60px';
          star.style.color = '#FFD700';
          star.style.textAlign = 'center';
          star.style.lineHeight = '60px';
          star.style.textShadow = '0 0 25px rgba(255, 215, 0, 0.9), 0 6px 12px rgba(0, 0, 0, 0.4)';
          star.textContent = '★';
          
          quizSquare.appendChild(star);
          this.circles.push(star);
        }
        
        currentX += colWidths[col];
      }
      currentY += rowHeights[row];
    }
    
    // 2秒後に★をクリア
    setTimeout(() => {
      this.clearStars();
    }, 2000);
  }
  
  // ランダムな削除位置を生成
  generateRandomRemovals(rows, cols, removeCount) {
    const positions = [];
    
    // 全ての位置を生成
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({ row, col });
      }
    }
    
    // 位置をシャッフル
    positions.sort(() => Math.random() - 0.5);
    
    // 指定された数だけ削除位置を返す
    return positions.slice(0, removeCount);
  }
  
  // ランダムな列幅を生成
  generateRandomWidths(count, totalWidth) {
    const widths = [];
    let remainingWidth = totalWidth;
    
    for (let i = 0; i < count - 1; i++) {
      const minWidth = totalWidth / count * 0.5; // 最小幅は平均の50%
      const maxWidth = totalWidth / count * 1.5; // 最大幅は平均の150%
      const randomWidth = Math.random() * (maxWidth - minWidth) + minWidth;
      widths.push(randomWidth);
      remainingWidth -= randomWidth;
    }
    
    // 最後の列は残りの幅を使用
    widths.push(Math.max(remainingWidth, totalWidth / count * 0.5));
    
    return widths;
  }
  
  // ランダムな行高を生成
  generateRandomHeights(count, totalHeight) {
    const heights = [];
    let remainingHeight = totalHeight;
    
    for (let i = 0; i < count - 1; i++) {
      const minHeight = totalHeight / count * 0.5; // 最小高は平均の50%
      const maxHeight = totalHeight / count * 1.5; // 最大高は平均の150%
      const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      heights.push(randomHeight);
      remainingHeight -= randomHeight;
    }
    
    // 最後の行は残りの高さを使用
    heights.push(Math.max(remainingHeight, totalHeight / count * 0.5));
    
    return heights;
  }
  
  // ★をクリア
  clearStars() {
    this.circles.forEach(star => {
      if (star.parentNode) {
        star.parentNode.removeChild(star);
      }
    });
    this.circles = [];
  }
  
  // 選択肢を生成（正解を含む3つ、重複なし）
  generateChoices() {
    const correctAnswer = this.correctAnswer;
    
    const choices = [correctAnswer]; // 正解を必ず含める
    const usedAnswers = new Set([correctAnswer]);
    
    if (this.isHardModeActive) {
      // ハードモード: 正解から誤差20%の範囲でランダム
      const errorRange = Math.floor(correctAnswer * 0.2); // 20%の誤差
      
      while (choices.length < 3) {
        const variation = Math.floor(Math.random() * (errorRange * 2 + 1)) - errorRange; // -20% ~ +20%
        const candidateAnswer = correctAnswer + variation;
        
        if (candidateAnswer > 0 && !usedAnswers.has(candidateAnswer)) {
          choices.push(candidateAnswer);
          usedAnswers.add(candidateAnswer);
        }
      }
    } else {
      // 通常モード: 行・列の変化パターンから選択
      const correctRows = this.rows;
      const correctCols = this.cols;
      
      // 可能な変化パターンを全て生成
      const allVariations = [];
      for (let rowChange = -1; rowChange <= 1; rowChange++) {
        for (let colChange = -1; colChange <= 1; colChange++) {
          if (rowChange === 0 && colChange === 0) continue; // 正解は除外
          allVariations.push({ rowChange, colChange });
        }
      }
      
      // パターンをシャッフル
      allVariations.sort(() => Math.random() - 0.5);
      
      // 重複しない選択肢を2つ追加生成（正解+2つで合計3つ）
      for (const variation of allVariations) {
        const newRows = Math.max(1, correctRows + variation.rowChange);
        const newCols = Math.max(1, correctCols + variation.colChange);
        const newAnswer = newRows * newCols;
        
        if (!usedAnswers.has(newAnswer)) {
          choices.push(newAnswer);
          usedAnswers.add(newAnswer);
          
          if (choices.length >= 3) break;
        }
      }
      
      // 3つに満たない場合は追加生成
      while (choices.length < 3) {
        const randomRowChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const randomColChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        
        if (randomRowChange === 0 && randomColChange === 0) continue;
        
        const newRows = Math.max(1, correctRows + randomRowChange);
        const newCols = Math.max(1, correctCols + randomColChange);
        const newAnswer = newRows * newCols;
        
        if (!usedAnswers.has(newAnswer)) {
          choices.push(newAnswer);
          usedAnswers.add(newAnswer);
        }
      }
    }
    
    // 3つに制限
    const finalChoices = choices.slice(0, 3);
    
    // 選択肢をシャッフル
    finalChoices.sort(() => Math.random() - 0.5);
    
    console.log('選択肢:', finalChoices);
    console.log('正解:', correctAnswer, this.isHardModeActive ? '(ハードモード)' : '(' + this.rows + '×' + this.cols + ')');
    
    return finalChoices;
  }
  
  // 解答結果を処理（連続正解数はQuizSystemで管理）
  handleAnswerResult(isCorrect) {
    // 連続正解数の更新はQuizSystemで行うため、ここでは何もしない
    console.log('計算クイズ解答結果:', isCorrect ? '正解' : '不正解');
    
    // 高難易度問題の枠と背景を通常色に徐々に復元
    if (this.isHardModeActive) {
      this.animateColorTransition(false);
    }
  }
  
  // クイズタイプを返す
  getQuizType() {
    return 'math';
  }
  
  // クイズ名を返す
  getQuizName() {
    return '計算クイズ';
  }
}
