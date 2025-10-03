// 汎用的なクイズシステム
class QuizSystem {
  constructor() {
    this.currentQuiz = null;
    this.isQuizActive = false;
    this.quizInterval = null;
    this.questionCounter = 0;
    this.correctCount = 0;
    this.totalQuestions = 0;
    
    // 全クイズ共通の連続正解数
    this.consecutiveCorrectCount = 0;
    
    // 利用可能なクイズタイプ
    this.availableQuizTypes = ['kanji', 'emoji', 'math'];
    
    // DOM要素の取得
    this.gameArea = document.getElementById('game-area');
    this.quizSquare = document.getElementById('kanji-square'); // 汎用的なクイズ表示エリア
    this.quizCharacter = document.querySelector('.kanji-character'); // 汎用的なクイズ文字表示
    this.buttonArea = document.getElementById('button-area');
    this.choicesContainer = document.querySelector('.choices-container');
    this.choiceButtons = document.querySelectorAll('.choice-button');
    
    // 音声要素
    this.hitSound = document.getElementById('hit');
    this.proSound = document.getElementById('pro');
    this.correctSound = document.getElementById('correct');
    this.errorSound = document.getElementById('error');
    this.optionSound = document.getElementById('option');
    
    // ノーツ関連
    this.circles = [];
    this.currentInterval = 3000;
    this.noteCounter = 0;
    this.isGeneratingNotes = false;
    this.currentNotesInterval = null;
    this.currentQuestion = null; // 現在の問題を初期化
    this.countdownTimer = null; // カウントダウンタイマー
    
    // ノーツ間隔のレベル
    this.noteIntervals = [
      { interval: 5000, desc: "低速" },
      { interval: 4000, desc: "やや低速" },
      { interval: 3000, desc: "中速" },
      { interval: 2500, desc: "やや高速" }
    ];
    
    this.initializeAudio();
    this.setupEventListeners();
  }
  
  // イベントリスナーを設定
  setupEventListeners() {
    this.choiceButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (!this.isQuizActive) return;
        
        const selectedValue = e.target.dataset.value;
        let isCorrect;
        
        if (this.currentQuestion?.quizType === 'emoji') {
          // 絵文字クイズの場合
          isCorrect = (selectedValue === this.currentQuestion.correctAnswer);
        } else if (this.currentQuestion?.quizType === 'math') {
          // 計算クイズの場合
          isCorrect = (parseInt(selectedValue) === this.currentQuestion.correctAnswer);
        } else {
          // 通常のクイズ（漢字など）
          isCorrect = (parseInt(selectedValue) === this.currentQuestion?.correctAnswer);
        }
        
        // 現在のクイズに解答結果を通知
        if (this.currentQuiz && this.currentQuiz.handleAnswerResult) {
          this.currentQuiz.handleAnswerResult(isCorrect);
        }
        
        this.handleAnswer(isCorrect);
      });
    });
  }
  
  // 音声初期化
  initializeAudio() {
    try {
      this.hitSound.volume = 0.7;
      this.hitSound.load();
      this.proSound.volume = 0.7;
      this.proSound.load();
    } catch (error) {
      console.log('Audio initialization failed');
    }
  }
  
  // ランダムなクイズタイプを選択
  selectRandomQuizType() {
    const randomIndex = Math.floor(Math.random() * this.availableQuizTypes.length);
    const selectedType = this.availableQuizTypes[randomIndex];
    console.log('ランダム選択:', randomIndex, '→', selectedType, '(利用可能:', this.availableQuizTypes, ')');
    return selectedType;
  }
  
  // 高難易度出題確率を計算（全クイズ共通）
  getHardDifficultyProbability() {
    if (this.consecutiveCorrectCount <= 0) return 0;      // 0% (初期状態)
    if (this.consecutiveCorrectCount === 1) return 0.20;   // 20%
    if (this.consecutiveCorrectCount === 2) return 0.40;   // 40%
    if (this.consecutiveCorrectCount >= 3) return 0.60;     // 60%以上
  }
  
  // クイズを開始
  startQuiz(quizType = null) {
    if (this.isQuizActive) return;
    
    this.isQuizActive = true;
    this.questionCounter = 0;
    this.correctCount = 0;
    this.totalQuestions = 0;
    this.consecutiveCorrectCount = 0; // 連続正解数をリセット
    
    // クイズタイプが指定されていない場合はランダム選択
    if (!quizType) {
      console.log('初回クイズ選択（ランダム）');
      quizType = this.selectRandomQuizType();
    }
    
    console.log('クイズ開始:', quizType);
    
    // クイズタイプに応じてクイズインスタンスを作成
    switch(quizType) {
      case 'kanji':
        this.currentQuiz = new KanjiQuiz();
        break;
      case 'emoji':
        this.currentQuiz = new EmojiQuiz();
        break;
      case 'math':
        this.currentQuiz = new MathQuiz();
        break;
      // 他のクイズタイプをここに追加
      default:
        console.error('Unknown quiz type:', quizType);
        return;
    }
    
    // ノーツ生成を開始
    this.startContinuousNotes();
    
    // 初回問題を開始
    this.scheduleNextQuestion();
  }
  
  // 次の問題をスケジュール（ランダムクイズ選択）
  scheduleNextRandomQuestion() {
    const delay = Math.random() * 110000 + 10000; // 5-10秒後（デバッグ用）
    setTimeout(() => {
      if (this.isQuizActive) {
        // ランダムなクイズタイプを選択
        const nextQuizType = this.selectRandomQuizType();
        console.log('次のクイズタイプ:', nextQuizType);
        
        // 新しいクイズインスタンスを作成
        switch(nextQuizType) {
          case 'kanji':
            this.currentQuiz = new KanjiQuiz();
            break;
          case 'emoji':
            this.currentQuiz = new EmojiQuiz();
            break;
          case 'math':
            this.currentQuiz = new MathQuiz();
            break;
        }
        
        this.showQuestion();
      }
    }, delay);
  }
  
  // 次の問題をスケジュール（初回用）
  scheduleNextQuestion() {
    const delay = Math.random() * 110000 + 10000; // 5-10秒後（デバッグ用）
    setTimeout(() => {
      if (this.isQuizActive) {
        this.showQuestion();
      }
    }, delay);
  }
  
  // 問題を表示
  async showQuestion() {
    if (!this.currentQuiz) return;
    
    try {
      // 共通の連続正解数をクイズに渡す
      this.currentQuiz.consecutiveCorrectCount = this.consecutiveCorrectCount;
      const question = await this.currentQuiz.generateQuestion();
      this.currentQuestion = question; // 現在の問題を保存
      this.displayQuestion(question);
    } catch (error) {
      console.error('Question generation failed:', error);
    }
  }
  
  // 問題を画面に表示
  async displayQuestion(question) {
    // 問題音を再生
    this.proSound.currentTime = 0;
    this.proSound.play().catch(() => {});
    
    // ボタンエリアを非表示
    this.buttonArea.style.display = 'none';
    
    if (question.quizType === 'emoji') {
      // 絵文字クイズの場合
      await this.currentQuiz.displayEmojis(this.quizCharacter);
      
      // 10秒後に選択肢を表示
      setTimeout(() => {
        this.showChoices(question);
      }, 10000);
    } else if (question.quizType === 'math') {
      // 計算クイズの場合
      await this.currentQuiz.displayCircles(this.quizSquare);
      
      // 10秒後に選択肢を表示
      setTimeout(() => {
        this.showChoices(question);
      }, 10000);
    } else {
      // 通常のクイズ（漢字など）
      this.quizCharacter.textContent = question.displayText;
      
      // 1秒後に問題を空白に戻す
      setTimeout(() => {
        this.quizCharacter.textContent = '';
        
        // 10秒後に選択肢を表示
        setTimeout(() => {
          this.showChoices(question);
        }, 10000);
      }, 1000);
    }
  }
  
  // 選択肢を表示
  showChoices(question) {
    // 選択肢表示音を再生
    if (this.optionSound.readyState >= 2) {
      this.optionSound.currentTime = 0;
      this.optionSound.play().catch(error => {
        console.log('選択肢音再生エラー:', error);
      });
    }
    
    let options;
    if (question.quizType === 'emoji') {
      // 絵文字クイズの場合
      options = this.currentQuiz.generateChoices();
      // 正解を更新
      question.correctAnswer = this.currentQuiz.correctAnswer;
    } else if (question.quizType === 'math') {
      // 計算クイズの場合
      options = this.currentQuiz.generateChoices();
    } else {
      // 通常のクイズ（漢字など）
      options = this.generateOptions(question.correctAnswer);
    }
    
    // ボタンに選択肢を設定
    this.choiceButtons.forEach((button, index) => {
      button.textContent = options[index];
      button.dataset.value = options[index];
    });
    
    // ボタンエリア全体を表示
    this.buttonArea.style.display = 'flex';
    
    // 5秒カウントダウン開始
    this.startCountdown();
  }
  
  // 選択肢を生成（10以上に調整）
  generateOptions(correctAnswer) {
    const patterns = [
      { min: correctAnswer - 2, max: correctAnswer },
      { min: correctAnswer - 1, max: correctAnswer + 1 },
      { min: correctAnswer, max: correctAnswer + 2 }
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const options = [];
    
    // 最小値が10未満の場合は10に調整
    const actualMin = Math.max(10, pattern.min);
    const actualMax = pattern.max + (pattern.min - actualMin);
    
    // 連続した3つの数字を生成
    for (let i = 0; i < 3; i++) {
      options.push(actualMin + i);
    }
    
    // 選択肢をシャッフル
    options.sort(() => Math.random() - 0.5);
    
    return options;
  }
  
  // カウントダウン表示
  startCountdown() {
    // 既存のカウントダウンを停止
    this.stopCountdown();
    
    let secondsLeft = 5;
    
    this.quizCharacter.classList.add('countdown');
    
    this.countdownTimer = setInterval(() => {
      this.quizCharacter.textContent = `${secondsLeft}`;
      secondsLeft--;
      
      if (secondsLeft < 0) {
        this.stopCountdown();
        // 時間切れ - 不正解扱い
        this.handleAnswer(false);
      }
    }, 1000);
  }
  
  // カウントダウン停止
  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.quizCharacter.classList.remove('countdown');
    this.quizCharacter.textContent = '';
  }
  
  // 解答処理
  handleAnswer(isCorrect) {
    // カウントダウンを停止
    this.stopCountdown();
    
    // ボタンエリアを隠す
    this.buttonArea.style.display = 'none';
    
    this.totalQuestions++;
    
    if (isCorrect) {
      this.correctCount++;
      this.consecutiveCorrectCount++; // 連続正解数を増加
      console.log('正解！連続正解数:', this.consecutiveCorrectCount);
      
      // 正解音を再生
      if (this.correctSound.readyState >= 2) {
        this.correctSound.currentTime = 0;
        this.correctSound.play().catch(() => {});
      }
      
      // 新しい速度でノーツ生成を再開
      const randomSpeed = this.noteIntervals[Math.floor(Math.random() * this.noteIntervals.length)];
      this.currentInterval = randomSpeed.interval;
      this.startContinuousNotes();
      
      // 次の問題をスケジュール（ランダムクイズ選択）
      this.scheduleNextRandomQuestion();
      
    } else {
      this.consecutiveCorrectCount = 0; // 連続正解数をリセット
      console.log('不正解...連続正解数リセット');
      
      // 不正解音を再生
      if (this.errorSound.readyState >= 2) {
        this.errorSound.currentTime = 0;
        this.errorSound.play().catch(() => {});
      }
      
      // ノーツをクリアして罰則パターン実行
      this.clearNotes();
      setTimeout(() => {
        this.executePenaltyPattern();
      }, 10);
    }
  }
  
  // ノーツ生成開始
  startContinuousNotes() {
    this.stopContinuousNotes();
    
    this.isGeneratingNotes = true;
    this.noteCounter = 0;
    
    this.currentNotesInterval = setInterval(() => {
      if (this.isGeneratingNotes) {
        this.spawnCircle();
        this.noteCounter++;
      } else {
        clearInterval(this.currentNotesInterval);
        this.currentNotesInterval = null;
      }
    }, this.currentInterval);
  }
  
  // ノーツ生成停止
  stopContinuousNotes() {
    this.isGeneratingNotes = false;
    if (this.currentNotesInterval) {
      clearInterval(this.currentNotesInterval);
      this.currentNotesInterval = null;
    }
  }
  
  // ノーツクリア
  clearNotes() {
    this.stopContinuousNotes();
    this.circles.forEach(circle => {
      if (circle.parentNode) {
        circle.parentNode.removeChild(circle);
      }
    });
    this.circles = [];
  }
  
  // 罰則パターン実行
  executePenaltyPattern() {
    console.log('罰則パターン開始 - 間隔: 700ms');
    
    let penaltyCount = 0;
    const penaltyInterval = setInterval(() => {
      this.spawnCircle(true); // 赤色でノーツ生成
      penaltyCount++;
      
      if (penaltyCount >= 20) {
        clearInterval(penaltyInterval);
        
        const checkEnd = () => {
          if (this.circles.length === 0) {
            console.log('罰則パターン完了 - ノーツ生成再開');
            
            const randomSpeed = this.noteIntervals[Math.floor(Math.random() * this.noteIntervals.length)];
            this.currentInterval = randomSpeed.interval;
            this.startContinuousNotes();
            
            setTimeout(() => {
              this.scheduleNextQuestion();
            }, Math.random() * 110000 + 10000); // 5-10秒後（デバッグ用）
          } else {
            setTimeout(checkEnd, 1000);
          }
        };
        setTimeout(checkEnd, 500);
      }
    }, 700);
  }
  
  // ノーツ生成
  spawnCircle(isPunishment = false) {
    const circle = document.createElement('div');
    circle.classList.add('circle');
    
    if (isPunishment) {
      circle.style.background = 'radial-gradient(circle, #FF6666 0%, #FF3333 30%, #CC1111 70%, #881111 100%)';
      circle.style.borderColor = '#FF6666';
      circle.style.boxShadow = '0 0 60px rgba(255, 102, 102, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.3)';
    }
    
    this.gameArea.appendChild(circle);
    this.circles.push(circle);
    
    const startTime = performance.now();
    const fallDuration = 3000;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / fallDuration;
      
      if (progress < 1) {
        const startX = this.gameArea.clientWidth;
        const endX = -window.innerWidth * 0.133;
        const posX = startX + (endX - startX) * progress;
        circle.style.left = posX + 'px';
        
        const judgeX = this.gameArea.clientWidth * 0.2;
        const center = posX + (window.innerWidth * 0.0665);
        
        if (!circle.played && center <= judgeX && circle.parentNode) {
          if (this.hitSound.readyState >= 2) {
            this.hitSound.currentTime = 0;
            this.hitSound.play().catch(() => {});
          }
          circle.played = true;
          circle.remove();
          this.circles = this.circles.filter(c => c !== circle);
          return;
        }
        requestAnimationFrame(animate);
      } else {
        circle.remove();
        this.circles = this.circles.filter(c => c !== circle);
      }
    };
    requestAnimationFrame(animate);
  }
  
  // クイズを停止
  stopQuiz() {
    this.isQuizActive = false;
    this.stopContinuousNotes();
    this.stopCountdown();
    this.clearNotes();
    
    if (this.currentQuiz) {
      this.currentQuiz = null;
    }
  }
}
