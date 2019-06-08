// consts
var STORE_QUESTION_COLUMN_COUNT = 40
var WAIT_TYPE_COLUMN_COUNT = 2
var WAIT_TYPE_QUESTION_COLUMN_COUNT = 40
var STORE_GROUP_CD = "KeyANY"
var WAIT_TYPE_GROUP_CD = "KeyWAIT_TYPE"
var STORE_GROUP_CD = "KeyAny"
var DISP_FLG = "TRUE"

// sheets
var spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
var sheet = spreadSheet.getSheetByName("input-steps")
var questionOutputSheet = spreadSheet.getSheetByName("question")
var choiceOutputSheet = spreadSheet.getSheetByName("choice")

// ステップ入力シートの最大行数 + タイトル行
var MAX_ROW_COUNT = sheet.getDataRange().getValues().length + 1

function main() {
  clearOutputSheet()
  store()
  waitType()
}

function waitType() {
  var currentWaitTypeId = ""
  var currentQuestionId = -1
  var currentChoiceId = -1

  // 質問階層分questionId管理リストを用意
  var qIdList = []
  for (i = 0; i < 20; i++) {
    qIdList.push(-1)
  }
  // 質問の表示順
  var qDispNo = -1

  // 選択肢の表示順
  var cDispNoList = []
  for (i = 0; i < 20; i++) {
    cDispNoList.push(-1)
  }

 // 行ごとにループ
 for (var i = 2; i < MAX_ROW_COUNT; i++) {
   var range = sheet.getRange(i, STORE_QUESTION_COLUMN_COUNT + 1, 1, WAIT_TYPE_COLUMN_COUNT + WAIT_TYPE_QUESTION_COLUMN_COUNT)
   // 行の値の配列
   var rowValues = range.getValues()[0]
   var waitTypeId = rowValues[0]
   // 待ち項目IDがあれば保持、dispNoをリセット
   if (waitTypeId != "") {
     currentWaitTypeId = waitTypeId
     qDispNo = -1
   }
   // 回答タイトル1
   var questionWord1 = rowValues[2]
   if (questionWord1 != "") {
     currentQuestionId += 1
     qIdList[0] = currentQuestionId
     qDispNo += 1
     cDispNoList[0] = -1
     waitTypeQuestion(currentWaitTypeId, qIdList[0], questionWord1, qDispNo, "")
   }
   Logger.log(currentQuestionId)
   var nextQuestionId1 = rowValues[4] != "" ? currentQuestionId + 1 : ""
   // 回答1
   var choiceWord1 = rowValues[3]
   if (choiceWord1 != "") {
     currentChoiceId += 1
     var choiceId1 = currentChoiceId
     cDispNoList[0] += 1
     waitTypeChoice(qIdList[0], choiceId1, choiceWord1, currentWaitTypeId, cDispNoList[0], nextQuestionId1)
   }
   // 回答タイトル2
   var questionWord2 = rowValues[4]
   if (questionWord2 != "") {
     currentQuestionId += 1
     qIdList[1] = currentQuestionId
     qDispNo += 1
     cDispNoList[1] = -1
     waitTypeQuestion(currentWaitTypeId, qIdList[1], questionWord2, qDispNo, "")
   }
   var nextQuestionId2 = rowValues[6] != "" ? currentQuestionId + 1 : ""
   // 回答2
   var choiceWord2 = rowValues[5]
   if (choiceWord2 != "") {
     currentChoiceId += 1
     var choiceId2 = currentChoiceId
     cDispNoList[1] += 1
     waitTypeChoice(qIdList[1], choiceId2, choiceWord2, currentWaitTypeId, cDispNoList[1], "")
   }
 }
 Browser.msgBox("スクリプト処理が完了しました。")
}

// 待ち項目に紐づく質問
function waitTypeQuestion(waitTypeId, questionId, questionWord, dispNo, nextQuestionId) {
  var rowValues = [
    WAIT_TYPE_GROUP_CD,
    zeroPadding(questionId, 10, false),
    questionWord,
    waitTypeId,
    DISP_FLG,
    dispNo,
    zeroPadding(nextQuestionId, 10, true)
  ]
  output("question", rowValues)
}

// 待ち項目に紐づく回答
function waitTypeChoice(questionId, choiceId, choiceWord, waitTypeId, dispNo, nextQuestionId) {
  var rowValues = [
    WAIT_TYPE_GROUP_CD,
    zeroPadding(questionId, 10, false),
    zeroPadding(choiceId, 5, false),
    choiceWord,
    waitTypeId,
    dispNo,
    zeroPadding(nextQuestionId, 10, true)
  ]
  output("choice", rowValues)
}

// 結果シートの値をクリア
function clearOutputSheet() {
  questionOutputSheet.clearContents()
  var titleValues = ["groupCd", "questionId", "questionWord", "waitTypeId", "dispFlg", "dispNo", "nextQuestionId"]
  var column = titleValues.length
  questionOutputSheet.getRange(1, 1, 1, column).setValues([titleValues])

  choiceOutputSheet.clearContents()
  var titleValues = ["groupCd", "questionId", "choiceId", "choiceWord", "waitTypeId", "dispNo", "nextQuestionId"]
  var column = titleValues.length
  choiceOutputSheet.getRange(1, 1, 1, column).setValues([titleValues])
}

// 結果シートに書き出し
function output(sheetName, rowValues) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  var lastRow = getLastRow(sheet)
  var row = lastRow + 1
  var column = rowValues.length
  sheet.getRange(row, 1, 1, column).setValues([rowValues])
}

// シートの値がある最終行を取得
function getLastRow(sheet) {
  const columnVals = sheet.getRange('A:A').getValues()
  return columnVals.filter(String).length
}

// length桁に合わせてゼロ埋め
function zeroPadding(num, length, isIgnoreEmpty) {
  return num > 0 || (num == 0 && !isIgnoreEmpty) ? ('0000000000' + num).slice(-length) : ""
}


// TODO: 店舗全体の質問回答
function store() {
  var currentQuestionId = -1
  var currentChoiceId = -1

  // 質問の表示順
  var qDispNo = -1

  // 選択肢の表示順
  var cDispNo = -1

 // 列ごとにループ
 for (var i = 1; i < STORE_QUESTION_COLUMN_COUNT; i++) {
   var range = sheet.getRange(2, i, 100, 1)
   // 列の値の配列
   var columnValues = range.getValues()
   if (i % 2 != 0) {
     // 奇数(質問)
     currentQuestionId += 1
     qDispNo += 1
     var questionWord = columnValues[0][0]
     // TODO: 要確認
     if (questionWord.lengh == 0) {
       break
     }
     // TODO:

     storeQuestion(currentQuestionId, questionWord, qDispNo)
   } else {
     // 偶数(回答)
     cDispNo = -1
     var choiceWordList = columnValues
     for (var k = 0; k < choiceWordList.length; k++) {
       var choiceWord = choiceWordList[k][0]
       if (choiceWord.length == 0) {
         break
       }
       currentChoiceId += 1
       cDispNo += 1
       storeChoice(currentQuestionId, currentChoiceId, choiceWord, cDispNo)
     }
   }
 }
}

// 店舗全体の質問
function storeQuestion(questionId, questionWord, dispNo) {
  var rowValues = [
    STORE_GROUP_CD,
    zeroPadding(questionId, 10, false),
    questionWord,
    null,
    DISP_FLG,
    dispNo,
    null
  ]
  output("question", rowValues)
}

// 店舗全体の回答
function storeChoice(questionId, choiceId, choiceWord, dispNo) {
  var rowValues = [
    STORE_GROUP_CD,
    zeroPadding(questionId, 10, false),
    zeroPadding(choiceId, 5, false),
    choiceWord,
    null,
    dispNo,
    null
  ]
  output("choice", rowValues)
}
