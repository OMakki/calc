$(function () {
  // モード選択後にドリルに移る
  $('#start').off('click').on('click', function () {
    // すべての選択肢を選択していないときはアラートを出す
    if (
      $("input[name='questions']:checked").val() === undefined || 
      $("input[name='operators']:checked").val() === undefined || 
      $("input[name='digits']:checked").val() === undefined || 
      $("input[name='timers']:checked").val() === undefined
    ) {
      alert('すべての項目を選択してください。');
      return false;
    };

    $('#selection').css('display', 'none');
    $('#countdown').css('display', 'block');
    questionNum = Number($("input[name='questions']:checked").val());
    operator = $("input[name='operators']:checked").val();
    digit = $("input[name='digits']:checked").val();
    timer = $("input[name='timers']:checked").val();
    passSec1 = 0;
    passSec2 = 0;
    stopTime = 0;

    // カウントダウン
    countDownID = setInterval('showCountDown()', 1000);

    // カウントダウン終了後
    setTimeout(() => {
      clearInterval(countDownID);
      $('#countdown').css('display', 'none');
      $('#drill').css('display', 'block');
      for (let index = 1; index <= questionNum; index++) {
        $('#drillContent').append(
          createDrillHtml(index)
        );
      }
      if (Number(timer) >= 3000) {
        // タイマーの時
        $('#timer').css('display', 'block');
        timerID = setInterval('Timer(Number(timer))', 10);
      } else if (Number(timer) === 1) {
        // ストップウォッチの時
        $('#stopWatch').css('display', 'block');
        startTime = Date.now();
        stopWatch(startTime);
      }
    }, 3999);
  });

  // 解答後に採点する
  $('#complete').off('click').on('click', function () {
    $('.correct, .incorrect').css('display', 'none');
    $('#result').css('display', 'block');
    for (let index = 1; index <= questionNum; index++) {
      checkAnswer(index);
    }
    let score = $('.correct:visible').length;
    $('#score').html(String(score) + '/' + String(questionNum) + '点');

    // 満点の時満点アイコンを出す
    if (score === questionNum) {
      $('#perfect').css('display', 'block');
    }

    if (Number(timer) >= 3000) {
      // タイマーの時
      const m = String(Math.floor(passSec2 / 6000) % 60).padStart(2, '0');
      const s = String(Math.floor(passSec2 / 100) % 60).padStart(2, '0');
      const ms = String(passSec2 % 100).padStart(2, '0');
      $('#timeResult').html(`タイム：${m}:${s}.${ms}`);
      clearInterval(timerID);
    } else if (Number(timer) === 1) {
      // ストップウォッチの時
      $('#timeResult').html('タイム：' + $('#stopWatch span').html());
      clearTimeout(stopWatchID);
    }
  });

  // 矢印キーもしくはエンター押下時に別のinputに移動するor採点ボタンを押す
  $(document).off('keydown', 'input[type="text"]').on('keydown', 'input[type="text"]', function(e) {
    let inputIndex = Number($(this).attr('id').replace(/[^0-9]/g, ''));
    if (e.keyCode === 38) {
      // 「↑」キー
      if (inputIndex >= 2) {
        $('#answer' + String(inputIndex - 1)).focus();
      } else {
        $(this).focus();
      }
      return false;
    } else if (e.keyCode === 40 || e.keyCode === 13) {
      // エンターキーもしくは「↓」キー
      if (inputIndex < questionNum) {
        $('#answer' + String(inputIndex + 1)).focus();
      } else if (inputIndex === questionNum && e.keyCode === 13){
        $('#complete').click();
      } else {
        $(this).focus();
      }
      return false;
    }
  });
});

// ドリル開始前のカウントダウン
function showCountDown() {
  passSec1++;
  let count = 4 - passSec1;
  $('#countdown').html(
    '<span>' + count + '</span>'
  );
  $('#countdown span').css({
    'display': 'block',
    'font-size': '72px',
    'width': 'fit-content',
    'margin': '48px auto 0',
  });
}

// ドリルの問題のHTMLを作る
function createDrillHtml(index) {
  let drillHtml = '';
  let firstNum = 0;
  let secondNum = 0;
  switch(digit) {
    case '1': // 1ケタ&1ケタ
    default: 
      firstNum = Math.floor(Math.random() * (9 - 1)) + 1;
      secondNum = Math.floor(Math.random() * (9 - 1)) + 1;
      break;
    case '2': // 1ケタ&2ケタ
      firstNum = Math.floor(Math.random() * (9 - 1)) + 1;
      secondNum = Math.floor(Math.random() * (99 - 10)) + 10;
      break;
    case '3': // 2ケタ&1ケタ
      firstNum = Math.floor(Math.random() * (99 - 10)) + 10;
      secondNum = Math.floor(Math.random() * (9 - 1)) + 1;
      break;
    case '4': // 2ケタ&2ケタ
      firstNum = Math.floor(Math.random() * (99 - 10)) + 10;
      secondNum = Math.floor(Math.random() * (99 - 10)) + 10;
      break;
  }
  drillHtml += '<div class="question"><div class="questionUnit"><div>' + ( '00' + index ).slice( -2 ) + '.</div>';
  drillHtml += '<div id="firstNum' + index + '">' + firstNum + '</div>';
  drillHtml += '<div id="operator' + index + '">' + operator + '</div>';
  drillHtml += '<div id="secondNum' + index + '">' + secondNum + '</div>';
  drillHtml += '<div>=</div><input id="answer' + index + '" type="text" name="answer' + index + '">';
  drillHtml += '<p id="correct' + index + '" class="correct">○</p><p id="incorrect' + index + '" class="incorrect">✕</p></div></div>';
  return drillHtml;
}

// タイマー
function Timer(limit) {
  passSec2++;
  var diff = limit - passSec2;
  const m = String(Math.floor(diff / 6000) % 60).padStart(2, '0');
  const s = String(Math.floor(diff / 100) % 60).padStart(2, '0');
  const ms = String(diff % 100).padStart(2, '0');
  $('#timer span').html(`${m}:${s}.${ms}`);
  if (diff <= 500) {
    // 残り時間が5秒以下の時
    $('#timer span').css('color', 'red');
  } else if (diff <= 0) {
    // 時間切れの時
    clearInterval(timerID);
    $('#timeUp').css('display', 'block');
  }
}

// ストップウォッチ
function stopWatch(startTime) {
  const currentTime = new Date(Date.now() - startTime + stopTime);
  const m = String(currentTime.getMinutes()).padStart(2, '0');
  const s = String(currentTime.getSeconds()).padStart(2, '0');
  const ms = String(currentTime.getMilliseconds()).padStart(3, '0');
  $('#stopWatch span').html(`${m}:${s}.${ms}`);
  stopWatchID = setTimeout('stopWatch(startTime)', 10);
}

// 採点
function checkAnswer(index) {
  let isCorrect;
  let answer = Number($('#answer' + index).val().replace(/[０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  }));
  switch(operator) {
    case '+':
      isCorrect = (answer === (Number($('#firstNum' + index).html()) + Number($('#secondNum' + index).html())));
      break;
    case '-':
      isCorrect = (answer === (Number($('#firstNum' + index).html()) - Number($('#secondNum' + index).html())));
      break;
    case '×':
      isCorrect = (answer === (Number($('#firstNum' + index).html()) * Number($('#secondNum' + index).html())));
      break;
  }
  if (isCorrect) {
    $('#correct' + index).css('display', 'block');
  } else {
    $('#incorrect' + index).css('display', 'block');
  }
}
