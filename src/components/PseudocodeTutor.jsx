import { useState, useEffect, useRef } from "react";
import { C, F, cardS } from "../constants";
import { useIsMobile } from "../hooks";

// ─── SYNTAX CARDS DATA ───
const SYNTAX_CARDS = [
  {
    title: "DECLARE & ←",
    titleKo: "변수 선언 & 대입",
    syntax: "DECLARE <name> : <type>\n<name> ← <value>",
    example: "DECLARE age : INTEGER\nage ← 15",
    explain: "변수를 만들고 값을 넣는 방법.\nDECLARE로 선언하고, ← (화살표)로 값을 넣습니다.\n자료형: INTEGER(정수), REAL(실수), STRING(문자열), CHAR(문자 1개), BOOLEAN(참/거짓)",
    titlePy: "변수 대입",
    pythonSyntax: "<name> = <value>",
    pythonExample: 'age = 15\nname = "Alice"\nis_student = True',
    pythonExplain: "Python은 DECLARE 없이 바로 대입합니다.\n타입을 지정하지 않아도 자동으로 감지됩니다.\nint(정수), float(실수), str(문자열), bool(참/거짓)",
  },
  {
    title: "INPUT / OUTPUT",
    titleKo: "입력 / 출력",
    syntax: "INPUT <variable>\nOUTPUT <value>",
    example: 'INPUT name\nOUTPUT "Hello, ", name',
    explain: "INPUT은 사용자로부터 값을 받습니다.\nOUTPUT은 화면에 값을 보여줍니다.\nOUTPUT에 콤마로 여러 값을 이어 출력할 수 있습니다.",
    titlePy: "입력 / 출력",
    pythonSyntax: '<var> = input(<prompt>)\nprint(<value>)',
    pythonExample: 'name = input("Enter name: ")\nage = int(input("Enter age: "))\nprint("Hello,", name)',
    pythonExplain: "input()은 항상 문자열(str)을 반환합니다.\n숫자가 필요하면 int() 또는 float()으로 변환해야 합니다.\nprint()로 출력하고, 콤마로 여러 값을 이어 출력합니다.",
  },
  {
    title: "IF / THEN / ELSE",
    titleKo: "조건문",
    syntax: "IF <condition> THEN\n  <statements>\nELSE\n  <statements>\nENDIF",
    example: 'IF score >= 50 THEN\n  OUTPUT "Pass"\nELSE\n  OUTPUT "Fail"\nENDIF',
    explain: "조건이 참이면 THEN 아래를 실행,\n거짓이면 ELSE 아래를 실행합니다.\nENDIF로 끝냅니다.\nELSE는 생략 가능합니다.",
    titlePy: "조건문",
    pythonSyntax: "if <condition>:\n    <statements>\nelse:\n    <statements>",
    pythonExample: 'if score >= 50:\n    print("Pass")\nelse:\n    print("Fail")',
    pythonExplain: "콜론(:)과 들여쓰기로 블록을 구분합니다.\nENDIF가 필요 없습니다!\nELSE IF 대신 elif를 사용합니다.",
  },
  {
    title: "CASE OF",
    titleKo: "선택문",
    syntax: 'CASE OF <variable>\n  <value1> : <statement>\n  <value2> : <statement>\n  OTHERWISE <statement>\nENDCASE',
    example: 'CASE OF grade\n  "A" : OUTPUT "Excellent"\n  "B" : OUTPUT "Good"\n  OTHERWISE OUTPUT "Try harder"\nENDCASE',
    explain: "변수 값에 따라 다른 동작을 합니다.\nIF-ELSE가 많을 때 더 깔끔하게 쓸 수 있습니다.\nOTHERWISE는 어떤 값에도 해당 안 될 때 실행됩니다.",
    titlePy: "선택문 (if/elif)",
    pythonSyntax: "if <var> == <val1>:\n    ...\nelif <var> == <val2>:\n    ...\nelse:\n    ...",
    pythonExample: 'if grade == "A":\n    print("Excellent")\nelif grade == "B":\n    print("Good")\nelse:\n    print("Try harder")',
    pythonExplain: "Python에는 CASE OF가 없습니다!\nif / elif / else로 대체합니다.\n(Python 3.10+에 match가 있지만 시험에는 안 나옴)",
  },
  {
    title: "FOR / NEXT",
    titleKo: "FOR 루프",
    syntax: "FOR <var> ← <start> TO <end>\n  <statements>\nNEXT <var>",
    example: "FOR i ← 1 TO 5\n  OUTPUT i\nNEXT i",
    explain: "정해진 횟수만큼 반복할 때 사용합니다.\n변수가 start부터 end까지 1씩 증가하며 반복합니다.\nSTEP 키워드로 증가량을 바꿀 수 있습니다.",
    titlePy: "for 루프",
    pythonSyntax: "for <var> in range(<start>, <end+1>):\n    <statements>",
    pythonExample: "for i in range(1, 6):\n    print(i)\n# 1,2,3,4,5 출력 (6은 포함 안 됨!)",
    pythonExplain: "⚠ range(1, 6)은 1~5입니다. 끝값 6은 포함 안 됨!\n의사코드 FOR i ← 1 TO 5 = Python range(1, 6)\nNEXT 필요 없이 들여쓰기로 블록을 구분합니다.",
  },
  {
    title: "WHILE / ENDWHILE",
    titleKo: "WHILE 루프",
    syntax: "WHILE <condition> DO\n  <statements>\nENDWHILE",
    example: "WHILE count < 10 DO\n  count ← count + 1\nENDWHILE",
    explain: "조건이 참인 동안 반복합니다.\n조건을 먼저 검사하므로 한 번도 실행 안 될 수 있습니다.\n반복 횟수를 모를 때 사용합니다.",
    titlePy: "while 루프",
    pythonSyntax: "while <condition>:\n    <statements>",
    pythonExample: "while count < 10:\n    count = count + 1",
    pythonExplain: "의사코드와 거의 같습니다!\nDO와 ENDWHILE이 필요 없고,\n콜론(:)과 들여쓰기로 블록을 구분합니다.",
  },
  {
    title: "REPEAT / UNTIL",
    titleKo: "REPEAT 루프",
    syntax: "REPEAT\n  <statements>\nUNTIL <condition>",
    example: 'REPEAT\n  INPUT password\nUNTIL password = "1234"',
    explain: "조건이 참이 될 때까지 반복합니다.\n최소 1번은 반드시 실행됩니다 (조건을 나중에 검사).\n입력 검증에 자주 사용됩니다.",
    titlePy: "while True + break",
    pythonSyntax: "while True:\n    <statements>\n    if <condition>:\n        break",
    pythonExample: 'while True:\n    password = input("Password: ")\n    if password == "1234":\n        break',
    pythonExplain: "Python에는 REPEAT...UNTIL이 없습니다!\nwhile True로 무한 루프를 만들고,\n조건이 맞으면 break로 빠져나옵니다.",
  },
  {
    title: "ARRAY",
    titleKo: "배열",
    syntax: "DECLARE <name> : ARRAY[<l>:<u>] OF <type>",
    example: "DECLARE scores : ARRAY[1:5] OF INTEGER\nscores[1] ← 85\nscores[2] ← 92",
    explain: "같은 타입의 값 여러 개를 하나의 이름으로 저장합니다.\n인덱스([ ])로 각 위치에 접근합니다.\nCambridge에서는 보통 1부터 시작합니다.",
    titlePy: "리스트 (list)",
    pythonSyntax: "<name> = [<values>]\n<name>[<index>] = <value>",
    pythonExample: "scores = [0, 0, 0, 0, 0]\nscores[0] = 85  # 인덱스 0부터!\nscores[1] = 92\n# 또는 바로: scores = [85, 92, 70]",
    pythonExplain: "Python 리스트 = 의사코드 배열.\n⚠ Python 인덱스는 0부터 시작! (의사코드는 보통 1부터)\nlen()으로 길이, .append()로 추가, .pop()으로 제거.",
  },
  {
    title: "FUNCTION / PROCEDURE",
    titleKo: "함수 & 프로시저",
    syntax: "FUNCTION <name>(<params>) RETURNS <type>\n  ...\n  RETURN <value>\nENDFUNCTION\n\nPROCEDURE <name>(<params>)\n  ...\nENDPROCEDURE",
    example: "FUNCTION double(n : INTEGER) RETURNS INTEGER\n  RETURN n * 2\nENDFUNCTION\n\nOUTPUT double(5)",
    explain: "FUNCTION: 값을 반환합니다 (RETURNS + RETURN 필수).\nPROCEDURE: 값을 반환하지 않고 동작만 수행합니다.\n코드를 재사용 가능하게 만듭니다.",
    titlePy: "함수 (def)",
    pythonSyntax: "def <name>(<params>):\n    ...\n    return <value>",
    pythonExample: 'def double(n):\n    return n * 2\n\ndef greet(name):\n    print("Hello", name)\n\nprint(double(5))\ngreet("Alice")',
    pythonExplain: "Python은 def 하나로 함수와 프로시저를 모두 만듭니다.\nFUNCTION/PROCEDURE 구분이 없습니다!\nreturn이 있으면 함수, 없으면 프로시저와 같습니다.\nCALL 키워드도 필요 없습니다.",
  },
  {
    title: "File Handling",
    titleKo: "파일 처리",
    syntax: 'OPENFILE <name> FOR READ|WRITE|APPEND\nREADFILE <name>, <var>\nWRITEFILE <name>, <data>\nCLOSEFILE <name>',
    example: 'OPENFILE "data.txt" FOR READ\nREADFILE "data.txt", line\nOUTPUT line\nCLOSEFILE "data.txt"',
    explain: "OPENFILE로 파일을 열고,\nREAD(읽기) / WRITE(쓰기) / APPEND(이어쓰기) 모드를 선택합니다.\nREADFILE / WRITEFILE로 데이터를 읽고 쓰고,\nCLOSEFILE로 닫습니다.",
    titlePy: "파일 처리",
    pythonSyntax: 'f = open(<name>, <mode>)\nline = f.readline()\nf.write(<data>)\nf.close()',
    pythonExample: 'f = open("data.txt", "r")\nline = f.readline()\nprint(line)\nf.close()\n\n# 더 좋은 방법 (with):\nwith open("data.txt", "r") as f:\n    line = f.readline()',
    pythonExplain: "모드: \"r\"(읽기), \"w\"(쓰기/덮어씀), \"a\"(이어쓰기)\nwith문을 쓰면 자동으로 닫아줍니다 (CLOSEFILE 불필요).\nreadline()은 한 줄, read()는 전체를 읽습니다.",
  },
];

// ─── TRACER EXAMPLES DATA ───
const TRACER_EXAMPLES = [
  {
    title: "1~5 출력",
    description: "1부터 5까지 출력하는 FOR 루프",
    code: [
      "FOR i ← 1 TO 5",
      "  OUTPUT i",
      "NEXT i",
    ],
    steps: [
      { line: 0, vars: { i: 1 }, output: [], explain: "FOR 루프 시작, i=1" },
      { line: 1, vars: { i: 1 }, output: [1], explain: "i(1) 출력" },
      { line: 0, vars: { i: 2 }, output: [1], explain: "i=2로 증가" },
      { line: 1, vars: { i: 2 }, output: [1, 2], explain: "i(2) 출력" },
      { line: 0, vars: { i: 3 }, output: [1, 2], explain: "i=3으로 증가" },
      { line: 1, vars: { i: 3 }, output: [1, 2, 3], explain: "i(3) 출력" },
      { line: 0, vars: { i: 4 }, output: [1, 2, 3], explain: "i=4로 증가" },
      { line: 1, vars: { i: 4 }, output: [1, 2, 3, 4], explain: "i(4) 출력" },
      { line: 0, vars: { i: 5 }, output: [1, 2, 3, 4], explain: "i=5로 증가" },
      { line: 1, vars: { i: 5 }, output: [1, 2, 3, 4, 5], explain: "i(5) 출력" },
      { line: 2, vars: { i: 5 }, output: [1, 2, 3, 4, 5], explain: "루프 종료 (i가 5에 도달)" },
    ],
    pythonCode: [
      "for i in range(1, 6):",
      "    print(i)",
    ],
    pythonSteps: [
      { line: 0, vars: { i: 1 }, output: [], explain: "for 루프 시작, i=1 (range(1,6)은 1~5)" },
      { line: 1, vars: { i: 1 }, output: [1], explain: "i(1) 출력" },
      { line: 0, vars: { i: 2 }, output: [1], explain: "i=2로 증가" },
      { line: 1, vars: { i: 2 }, output: [1, 2], explain: "i(2) 출력" },
      { line: 0, vars: { i: 3 }, output: [1, 2], explain: "i=3으로 증가" },
      { line: 1, vars: { i: 3 }, output: [1, 2, 3], explain: "i(3) 출력" },
      { line: 0, vars: { i: 4 }, output: [1, 2, 3], explain: "i=4로 증가" },
      { line: 1, vars: { i: 4 }, output: [1, 2, 3, 4], explain: "i(4) 출력" },
      { line: 0, vars: { i: 5 }, output: [1, 2, 3, 4], explain: "i=5로 증가" },
      { line: 1, vars: { i: 5 }, output: [1, 2, 3, 4, 5], explain: "i(5) 출력" },
      { line: 0, vars: { i: 5 }, output: [1, 2, 3, 4, 5], explain: "range 소진, 루프 종료" },
    ],
  },
  {
    title: "짝수만 출력",
    description: "1~10 중 짝수만 출력 (IF + MOD)",
    code: [
      "FOR i ← 1 TO 10",
      "  IF i MOD 2 = 0 THEN",
      "    OUTPUT i",
      "  ENDIF",
      "NEXT i",
    ],
    steps: [
      { line: 0, vars: { i: 1 }, output: [], explain: "FOR 루프 시작, i=1" },
      { line: 1, vars: { i: 1 }, output: [], explain: "1 MOD 2 = 1 ≠ 0 → 거짓 (홀수)" },
      { line: 0, vars: { i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 1, vars: { i: 2 }, output: [], explain: "2 MOD 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 2 }, output: [2], explain: "i(2) 출력" },
      { line: 0, vars: { i: 3 }, output: [2], explain: "i=3으로 증가" },
      { line: 1, vars: { i: 3 }, output: [2], explain: "3 MOD 2 = 1 ≠ 0 → 거짓" },
      { line: 0, vars: { i: 4 }, output: [2], explain: "i=4로 증가" },
      { line: 1, vars: { i: 4 }, output: [2], explain: "4 MOD 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 4 }, output: [2, 4], explain: "i(4) 출력" },
      { line: 0, vars: { i: 5 }, output: [2, 4], explain: "i=5로 증가" },
      { line: 1, vars: { i: 5 }, output: [2, 4], explain: "5 MOD 2 = 1 ≠ 0 → 거짓" },
      { line: 0, vars: { i: 6 }, output: [2, 4], explain: "i=6으로 증가" },
      { line: 1, vars: { i: 6 }, output: [2, 4], explain: "6 MOD 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 6 }, output: [2, 4, 6], explain: "i(6) 출력" },
      { line: 0, vars: { i: 7 }, output: [2, 4, 6], explain: "i=7로 증가" },
      { line: 1, vars: { i: 7 }, output: [2, 4, 6], explain: "7 MOD 2 = 1 ≠ 0 → 거짓" },
      { line: 0, vars: { i: 8 }, output: [2, 4, 6], explain: "i=8로 증가" },
      { line: 1, vars: { i: 8 }, output: [2, 4, 6], explain: "8 MOD 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 8 }, output: [2, 4, 6, 8], explain: "i(8) 출력" },
      { line: 0, vars: { i: 9 }, output: [2, 4, 6, 8], explain: "i=9로 증가" },
      { line: 1, vars: { i: 9 }, output: [2, 4, 6, 8], explain: "9 MOD 2 = 1 ≠ 0 → 거짓" },
      { line: 0, vars: { i: 10 }, output: [2, 4, 6, 8], explain: "i=10으로 증가" },
      { line: 1, vars: { i: 10 }, output: [2, 4, 6, 8], explain: "10 MOD 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 10 }, output: [2, 4, 6, 8, 10], explain: "i(10) 출력" },
      { line: 4, vars: { i: 10 }, output: [2, 4, 6, 8, 10], explain: "루프 종료" },
    ],
    pythonCode: [
      "for i in range(1, 11):",
      "    if i % 2 == 0:",
      "        print(i)",
    ],
    pythonSteps: [
      { line: 0, vars: { i: 1 }, output: [], explain: "for 루프 시작, i=1 (range(1,11)은 1~10)" },
      { line: 1, vars: { i: 1 }, output: [], explain: "1 % 2 = 1 ≠ 0 → 거짓 (홀수)" },
      { line: 0, vars: { i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 1, vars: { i: 2 }, output: [], explain: "2 % 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 2 }, output: [2], explain: "i(2) 출력" },
      { line: 0, vars: { i: 4 }, output: [2], explain: "i=3 거짓... i=4로" },
      { line: 1, vars: { i: 4 }, output: [2], explain: "4 % 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 4 }, output: [2, 4], explain: "i(4) 출력" },
      { line: 0, vars: { i: 6 }, output: [2, 4], explain: "i=5 거짓... i=6으로" },
      { line: 1, vars: { i: 6 }, output: [2, 4], explain: "6 % 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 6 }, output: [2, 4, 6], explain: "i(6) 출력" },
      { line: 0, vars: { i: 8 }, output: [2, 4, 6], explain: "i=7 거짓... i=8로" },
      { line: 1, vars: { i: 8 }, output: [2, 4, 6], explain: "8 % 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 8 }, output: [2, 4, 6, 8], explain: "i(8) 출력" },
      { line: 0, vars: { i: 10 }, output: [2, 4, 6, 8], explain: "i=9 거짓... i=10으로" },
      { line: 1, vars: { i: 10 }, output: [2, 4, 6, 8], explain: "10 % 2 = 0 → 참 (짝수!)" },
      { line: 2, vars: { i: 10 }, output: [2, 4, 6, 8, 10], explain: "i(10) 출력" },
      { line: 0, vars: { i: 10 }, output: [2, 4, 6, 8, 10], explain: "range 소진, 루프 종료" },
    ],
  },
  {
    title: "합계 구하기",
    description: "1부터 5까지의 합계를 구하는 프로그램",
    code: [
      "DECLARE total : INTEGER",
      "total ← 0",
      "FOR i ← 1 TO 5",
      "  total ← total + i",
      "NEXT i",
      "OUTPUT total",
    ],
    steps: [
      { line: 0, vars: { total: 0 }, output: [], explain: "total 변수를 정수형으로 선언" },
      { line: 1, vars: { total: 0 }, output: [], explain: "total을 0으로 초기화" },
      { line: 2, vars: { total: 0, i: 1 }, output: [], explain: "FOR 루프 시작, i=1" },
      { line: 3, vars: { total: 1, i: 1 }, output: [], explain: "total = 0 + 1 = 1" },
      { line: 2, vars: { total: 1, i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 3, vars: { total: 3, i: 2 }, output: [], explain: "total = 1 + 2 = 3" },
      { line: 2, vars: { total: 3, i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 3, vars: { total: 6, i: 3 }, output: [], explain: "total = 3 + 3 = 6" },
      { line: 2, vars: { total: 6, i: 4 }, output: [], explain: "i=4로 증가" },
      { line: 3, vars: { total: 10, i: 4 }, output: [], explain: "total = 6 + 4 = 10" },
      { line: 2, vars: { total: 10, i: 5 }, output: [], explain: "i=5로 증가" },
      { line: 3, vars: { total: 15, i: 5 }, output: [], explain: "total = 10 + 5 = 15" },
      { line: 4, vars: { total: 15, i: 5 }, output: [], explain: "루프 종료" },
      { line: 5, vars: { total: 15, i: 5 }, output: [15], explain: "total(15) 출력!" },
    ],
    pythonCode: [
      "total = 0",
      "for i in range(1, 6):",
      "    total = total + i",
      "print(total)",
    ],
    pythonSteps: [
      { line: 0, vars: { total: 0 }, output: [], explain: "total을 0으로 초기화 (선언 불필요)" },
      { line: 1, vars: { total: 0, i: 1 }, output: [], explain: "for 루프 시작, i=1" },
      { line: 2, vars: { total: 1, i: 1 }, output: [], explain: "total = 0 + 1 = 1" },
      { line: 1, vars: { total: 1, i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 2, vars: { total: 3, i: 2 }, output: [], explain: "total = 1 + 2 = 3" },
      { line: 1, vars: { total: 3, i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 2, vars: { total: 6, i: 3 }, output: [], explain: "total = 3 + 3 = 6" },
      { line: 1, vars: { total: 6, i: 4 }, output: [], explain: "i=4로 증가" },
      { line: 2, vars: { total: 10, i: 4 }, output: [], explain: "total = 6 + 4 = 10" },
      { line: 1, vars: { total: 10, i: 5 }, output: [], explain: "i=5로 증가" },
      { line: 2, vars: { total: 15, i: 5 }, output: [], explain: "total = 10 + 5 = 15" },
      { line: 1, vars: { total: 15, i: 5 }, output: [], explain: "range 소진, 루프 종료" },
      { line: 3, vars: { total: 15, i: 5 }, output: [15], explain: "total(15) 출력!" },
    ],
  },
  {
    title: "최대값 찾기",
    description: "배열에서 가장 큰 값을 찾는 프로그램",
    code: [
      "DECLARE nums : ARRAY[1:5] OF INTEGER",
      "nums ← [3, 7, 2, 9, 4]",
      "max ← nums[1]",
      "FOR i ← 2 TO 5",
      "  IF nums[i] > max THEN",
      "    max ← nums[i]",
      "  ENDIF",
      "NEXT i",
      "OUTPUT max",
    ],
    steps: [
      { line: 0, vars: { nums: "[3,7,2,9,4]" }, output: [], explain: "정수 배열 선언 (5칸)" },
      { line: 1, vars: { nums: "[3,7,2,9,4]" }, output: [], explain: "배열에 값 넣기: [3, 7, 2, 9, 4]" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max: 3 }, output: [], explain: "max를 첫 번째 값(3)으로 설정" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max: 3, i: 2 }, output: [], explain: "FOR 루프 시작, i=2" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max: 3, i: 2 }, output: [], explain: "nums[2]=7 > max(3)? → 참!" },
      { line: 5, vars: { nums: "[3,7,2,9,4]", max: 7, i: 2 }, output: [], explain: "max = 7로 업데이트" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max: 7, i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max: 7, i: 3 }, output: [], explain: "nums[3]=2 > max(7)? → 거짓" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max: 7, i: 4 }, output: [], explain: "i=4로 증가" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max: 7, i: 4 }, output: [], explain: "nums[4]=9 > max(7)? → 참!" },
      { line: 5, vars: { nums: "[3,7,2,9,4]", max: 9, i: 4 }, output: [], explain: "max = 9로 업데이트" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max: 9, i: 5 }, output: [], explain: "i=5로 증가" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max: 9, i: 5 }, output: [], explain: "nums[5]=4 > max(9)? → 거짓" },
      { line: 7, vars: { nums: "[3,7,2,9,4]", max: 9, i: 5 }, output: [], explain: "루프 종료" },
      { line: 8, vars: { nums: "[3,7,2,9,4]", max: 9, i: 5 }, output: [9], explain: "max(9) 출력! 최대값은 9" },
    ],
    pythonCode: [
      "nums = [3, 7, 2, 9, 4]",
      "max_val = nums[0]",
      "for i in range(1, len(nums)):",
      "    if nums[i] > max_val:",
      "        max_val = nums[i]",
      "print(max_val)",
    ],
    pythonSteps: [
      { line: 0, vars: { nums: "[3,7,2,9,4]" }, output: [], explain: "리스트 생성: [3, 7, 2, 9, 4]" },
      { line: 1, vars: { nums: "[3,7,2,9,4]", max_val: 3 }, output: [], explain: "max_val를 첫 번째 값(인덱스 0 → 3)으로 설정" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max_val: 3, i: 1 }, output: [], explain: "for 루프 시작, i=1 (인덱스 0부터!)" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max_val: 3, i: 1 }, output: [], explain: "nums[1]=7 > max_val(3)? → 참!" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max_val: 7, i: 1 }, output: [], explain: "max_val = 7로 업데이트" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max_val: 7, i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max_val: 7, i: 2 }, output: [], explain: "nums[2]=2 > max_val(7)? → 거짓" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max_val: 7, i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max_val: 7, i: 3 }, output: [], explain: "nums[3]=9 > max_val(7)? → 참!" },
      { line: 4, vars: { nums: "[3,7,2,9,4]", max_val: 9, i: 3 }, output: [], explain: "max_val = 9로 업데이트" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max_val: 9, i: 4 }, output: [], explain: "i=4로 증가" },
      { line: 3, vars: { nums: "[3,7,2,9,4]", max_val: 9, i: 4 }, output: [], explain: "nums[4]=4 > max_val(9)? → 거짓" },
      { line: 2, vars: { nums: "[3,7,2,9,4]", max_val: 9, i: 4 }, output: [], explain: "range 소진, 루프 종료" },
      { line: 5, vars: { nums: "[3,7,2,9,4]", max_val: 9, i: 4 }, output: [9], explain: "max_val(9) 출력! 최대값은 9" },
    ],
  },
  {
    title: "입력 검증",
    description: "올바른 값이 입력될 때까지 반복 (REPEAT...UNTIL)",
    code: [
      "DECLARE age : INTEGER",
      "REPEAT",
      '  OUTPUT "나이를 입력하세요 (1-120):"',
      "  INPUT age",
      "UNTIL age >= 1 AND age <= 120",
      'OUTPUT "입력된 나이: ", age',
    ],
    steps: [
      { line: 0, vars: { age: 0 }, output: [], explain: "age 변수 선언" },
      { line: 1, vars: { age: 0 }, output: [], explain: "REPEAT 루프 시작 (최소 1번 실행)" },
      { line: 2, vars: { age: 0 }, output: ["나이를 입력하세요 (1-120):"], explain: "안내 메시지 출력" },
      { line: 3, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):"], explain: "사용자가 -5 입력 (잘못된 값)" },
      { line: 4, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):"], explain: "-5 >= 1 AND -5 <= 120? → 거짓! 다시 반복" },
      { line: 2, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "안내 메시지 다시 출력" },
      { line: 3, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "사용자가 200 입력 (범위 초과)" },
      { line: 4, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "200 >= 1 AND 200 <= 120? → 거짓! 다시 반복" },
      { line: 2, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "안내 메시지 다시 출력" },
      { line: 3, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "사용자가 17 입력 (올바른 값!)" },
      { line: 4, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "17 >= 1 AND 17 <= 120? → 참! 루프 종료" },
      { line: 5, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "입력된 나이: 17"], explain: "입력된 나이(17) 출력!" },
    ],
    pythonCode: [
      "while True:",
      '    print("나이를 입력하세요 (1-120):")',
      "    age = int(input())",
      "    if 1 <= age <= 120:",
      "        break",
      'print("입력된 나이:", age)',
    ],
    pythonSteps: [
      { line: 0, vars: {}, output: [], explain: "while True: 무한 루프 시작 (최소 1번 실행)" },
      { line: 1, vars: {}, output: ["나이를 입력하세요 (1-120):"], explain: "안내 메시지 출력" },
      { line: 2, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):"], explain: "사용자가 -5 입력 → int()로 변환" },
      { line: 3, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):"], explain: "1 <= -5 <= 120? → 거짓! break 안 함" },
      { line: 0, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):"], explain: "while True → 다시 반복" },
      { line: 1, vars: { age: -5 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "안내 메시지 다시 출력" },
      { line: 2, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "사용자가 200 입력" },
      { line: 3, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "1 <= 200 <= 120? → 거짓! break 안 함" },
      { line: 0, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "while True → 다시 반복" },
      { line: 1, vars: { age: 200 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "안내 메시지 다시 출력" },
      { line: 2, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "사용자가 17 입력 (올바른 값!)" },
      { line: 3, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "1 <= 17 <= 120? → 참!" },
      { line: 4, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):"], explain: "break! 루프 종료" },
      { line: 5, vars: { age: 17 }, output: ["나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "나이를 입력하세요 (1-120):", "입력된 나이: 17"], explain: "입력된 나이(17) 출력!" },
    ],
  },
  {
    title: "선형 검색",
    description: "배열에서 특정 값을 찾는 프로그램",
    code: [
      "DECLARE names : ARRAY[1:5] OF STRING",
      'names ← ["Kim", "Lee", "Park", "Choi", "Jung"]',
      "DECLARE target : STRING",
      'target ← "Choi"',
      "found ← FALSE",
      "FOR i ← 1 TO 5",
      "  IF names[i] = target THEN",
      "    found ← TRUE",
      '    OUTPUT "Found at position ", i',
      "  ENDIF",
      "NEXT i",
      "IF found = FALSE THEN",
      '  OUTPUT "Not found"',
      "ENDIF",
    ],
    steps: [
      { line: 0, vars: { names: "[Kim,Lee,Park,Choi,Jung]" }, output: [], explain: "문자열 배열 선언 (5칸)" },
      { line: 1, vars: { names: "[Kim,Lee,Park,Choi,Jung]" }, output: [], explain: "배열에 이름 5개 저장" },
      { line: 2, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "" }, output: [], explain: "target 변수 선언" },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi" }, output: [], explain: '찾을 값: "Choi"' },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE" }, output: [], explain: "found를 FALSE로 초기화 (아직 못 찾음)" },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 1 }, output: [], explain: "FOR 루프 시작, i=1" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 1 }, output: [], explain: 'names[1]="Kim" = "Choi"? → 거짓' },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 2 }, output: [], explain: 'names[2]="Lee" = "Choi"? → 거짓' },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 3 }, output: [], explain: 'names[3]="Park" = "Choi"? → 거짓' },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 4 }, output: [], explain: "i=4로 증가" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "FALSE", i: 4 }, output: [], explain: 'names[4]="Choi" = "Choi"? → 참! 찾았다!' },
      { line: 7, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 4 }, output: [], explain: "found = TRUE로 변경" },
      { line: 8, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 4 }, output: ["Found at position 4"], explain: '"위치 4에서 찾음" 출력' },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 5 }, output: ["Found at position 4"], explain: "i=5로 증가 (계속 검색)" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 5 }, output: ["Found at position 4"], explain: 'names[5]="Jung" = "Choi"? → 거짓' },
      { line: 10, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 5 }, output: ["Found at position 4"], explain: "루프 종료" },
      { line: 11, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 5 }, output: ["Found at position 4"], explain: "found = FALSE? → 거짓 (found는 TRUE)" },
      { line: 13, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "TRUE", i: 5 }, output: ["Found at position 4"], explain: "프로그램 종료. Choi를 위치 4에서 찾음!" },
    ],
    pythonCode: [
      'names = ["Kim", "Lee", "Park", "Choi", "Jung"]',
      'target = "Choi"',
      "found = False",
      "for i in range(len(names)):",
      "    if names[i] == target:",
      "        found = True",
      '        print("Found at index", i)',
      "if not found:",
      '    print("Not found")',
    ],
    pythonSteps: [
      { line: 0, vars: { names: "[Kim,Lee,Park,Choi,Jung]" }, output: [], explain: "리스트 생성 (인덱스 0~4)" },
      { line: 1, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi" }, output: [], explain: '찾을 값: "Choi"' },
      { line: 2, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False" }, output: [], explain: "found = False (아직 못 찾음)" },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 0 }, output: [], explain: "for 루프 시작, i=0 (Python은 0부터!)" },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 0 }, output: [], explain: 'names[0]="Kim" == "Choi"? → 거짓' },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 1 }, output: [], explain: "i=1로 증가" },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 1 }, output: [], explain: 'names[1]="Lee" == "Choi"? → 거짓' },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 2 }, output: [], explain: "i=2로 증가" },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 2 }, output: [], explain: 'names[2]="Park" == "Choi"? → 거짓' },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 3 }, output: [], explain: "i=3으로 증가" },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "False", i: 3 }, output: [], explain: 'names[3]="Choi" == "Choi"? → 참! 찾았다!' },
      { line: 5, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 3 }, output: [], explain: "found = True로 변경" },
      { line: 6, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 3 }, output: ["Found at index 3"], explain: '"인덱스 3에서 찾음" 출력' },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 4 }, output: ["Found at index 3"], explain: "i=4로 증가 (계속 검색)" },
      { line: 4, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 4 }, output: ["Found at index 3"], explain: 'names[4]="Jung" == "Choi"? → 거짓' },
      { line: 3, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 4 }, output: ["Found at index 3"], explain: "range 소진, 루프 종료" },
      { line: 7, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 4 }, output: ["Found at index 3"], explain: "not found? → 거짓 (found는 True)" },
      { line: 8, vars: { names: "[Kim,Lee,Park,Choi,Jung]", target: "Choi", found: "True", i: 4 }, output: ["Found at index 3"], explain: "프로그램 종료. Choi를 인덱스 3에서 찾음!" },
    ],
  },
];

// ─── COMPARISON DATA ───
const COMPARISONS = [
  {
    title: "변수 선언 & 입출력",
    pseudo: [
      "DECLARE name : STRING",
      "DECLARE age : INTEGER",
      "INPUT name",
      "INPUT age",
      'OUTPUT "Hello, ", name',
      'OUTPUT "Age: ", age',
    ],
    python: [
      "# 선언 없이 바로 사용",
      "# 타입 지정 불필요",
      'name = input("Enter name: ")',
      'age = int(input("Enter age: "))',
      'print("Hello,", name)',
      'print("Age:", age)',
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]],
  },
  {
    title: "IF 조건문",
    pseudo: [
      "IF score >= 90 THEN",
      '  OUTPUT "A"',
      "ELSE",
      "  IF score >= 70 THEN",
      '    OUTPUT "B"',
      "  ELSE",
      '    OUTPUT "C"',
      "  ENDIF",
      "ENDIF",
    ],
    python: [
      "if score >= 90:",
      '    print("A")',
      "else:",
      "    if score >= 70:",
      '        print("B")',
      "    else:",
      '        print("C")',
      "    # 들여쓰기로 끝남",
      "# 들여쓰기로 끝남",
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8]],
  },
  {
    title: "FOR / WHILE / REPEAT 루프",
    pseudo: [
      "// FOR 루프",
      "FOR i ← 1 TO 5",
      "  OUTPUT i",
      "NEXT i",
      "",
      "// WHILE 루프",
      "WHILE x < 10 DO",
      "  x ← x + 1",
      "ENDWHILE",
      "",
      "// REPEAT 루프",
      "REPEAT",
      "  INPUT num",
      "UNTIL num > 0",
    ],
    python: [
      "# for 루프",
      "for i in range(1, 6):",
      "    print(i)",
      "# range(1,6) = 1,2,3,4,5",
      "",
      "# while 루프",
      "while x < 10:",
      "    x = x + 1",
      "# 들여쓰기로 끝남",
      "",
      "# repeat → while True + break",
      "while True:",
      "    num = int(input())",
      "    if num > 0: break",
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13]],
  },
  {
    title: "배열 (ARRAY vs list)",
    pseudo: [
      "DECLARE nums : ARRAY[1:5] OF INTEGER",
      "nums[1] ← 10",
      "nums[2] ← 20",
      "nums[3] ← 30",
      "FOR i ← 1 TO 3",
      "  OUTPUT nums[i]",
      "NEXT i",
    ],
    python: [
      "nums = [0] * 5  # 리스트 생성",
      "nums[0] = 10  # 인덱스 0부터!",
      "nums[1] = 20",
      "nums[2] = 30",
      "for i in range(0, 3):",
      "    print(nums[i])",
      "# range(0,3) = 0,1,2",
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]],
  },
  {
    title: "함수 & 프로시저",
    pseudo: [
      "FUNCTION add(a:INTEGER, b:INTEGER)",
      "    RETURNS INTEGER",
      "  RETURN a + b",
      "ENDFUNCTION",
      "",
      "PROCEDURE greet(name : STRING)",
      '  OUTPUT "Hello ", name',
      "ENDPROCEDURE",
      "",
      "OUTPUT add(3, 5)",
      'CALL greet("World")',
    ],
    python: [
      "def add(a, b):",
      "    # 타입 지정 없음",
      "    return a + b",
      "# 들여쓰기로 끝남",
      "",
      "def greet(name):",
      '    print("Hello", name)',
      "# 들여쓰기로 끝남",
      "",
      "print(add(3, 5))",
      'greet("World")',
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]],
  },
  {
    title: "파일 처리",
    pseudo: [
      'OPENFILE "data.txt" FOR READ',
      'READFILE "data.txt", line',
      "OUTPUT line",
      'CLOSEFILE "data.txt"',
      "",
      'OPENFILE "out.txt" FOR WRITE',
      'WRITEFILE "out.txt", "Hello"',
      'CLOSEFILE "out.txt"',
    ],
    python: [
      'f = open("data.txt", "r")',
      "line = f.readline()",
      "print(line)",
      "f.close()",
      "",
      'f = open("out.txt", "w")',
      'f.write("Hello")',
      "f.close()",
    ],
    lineMap: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
  },
];

// ─── SUB-TAB CONFIG ───
const SUB_TABS = [
  { key: "syntax", label: "📖 문법 카드" },
  { key: "tracer", label: "🔍 코드 따라가기" },
  { key: "compare", label: "🔄 의사코드 ↔ Python" },
];

// ─── MAIN COMPONENT ───
export default function PseudocodeTutor() {
  const [tab, setTab] = useState("syntax");
  const mobile = useIsMobile();

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
        overflowX: "auto", paddingBottom: 4,
      }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: mobile ? "8px 14px" : "10px 20px",
            borderRadius: 12,
            border: tab === t.key ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
            background: tab === t.key ? C.purpleLight : C.white,
            color: tab === t.key ? C.purple : C.sub,
            fontWeight: 700, fontSize: mobile ? 13 : 14,
            cursor: "pointer", fontFamily: F,
            whiteSpace: "nowrap",
            transition: "all .15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "syntax" && <SyntaxCards mobile={mobile} />}
      {tab === "tracer" && <CodeTracer mobile={mobile} />}
      {tab === "compare" && <CodeCompare mobile={mobile} />}
    </div>
  );
}

// ─── TAB A: SYNTAX CARDS ───
function SyntaxCards({ mobile }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [lang, setLang] = useState("pseudo"); // "pseudo" | "python"

  const isPy = lang === "python";
  const accent = isPy ? C.blue : C.purple;
  const accentLight = isPy ? C.blueLight : C.purpleLight;
  const codeBg = isPy ? "#0F172A" : "#1E1B4B";
  const codeColor = isPy ? "#93C5FD" : "#E0E7FF";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: 0 }}>
            {isPy ? "Python 문법" : "Cambridge IGCSE 의사코드 문법"}
          </h2>
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
            카드를 클릭하면 상세 설명을 볼 수 있습니다
          </p>
        </div>
        {/* Language toggle */}
        <div style={{
          display: "flex", borderRadius: 10, overflow: "hidden",
          border: `1.5px solid ${C.border}`,
        }}>
          {[
            { key: "pseudo", label: "의사코드", icon: "📝" },
            { key: "python", label: "Python", icon: "🐍" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setLang(opt.key)} style={{
              padding: "7px 14px",
              border: "none",
              background: lang === opt.key
                ? (opt.key === "python" ? C.blue : C.purple)
                : C.white,
              color: lang === opt.key ? "#fff" : C.sub,
              fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: F,
              display: "flex", alignItems: "center", gap: 4,
              transition: "all .15s",
            }}>
              <span style={{ fontSize: 14 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {SYNTAX_CARDS.map((card, idx) => {
        const isOpen = openIdx === idx;
        const titleText = isPy ? (card.titlePy || card.titleKo) : card.title;
        const titleSub = isPy ? card.title : card.titleKo;
        const syntaxText = isPy ? card.pythonSyntax : card.syntax;
        const exampleText = isPy ? card.pythonExample : card.example;
        const explainText = isPy ? card.pythonExplain : card.explain;

        return (
          <div key={`${lang}-${idx}`} style={{
            ...cardS,
            cursor: "pointer",
            borderColor: isOpen ? accent : C.border,
            transition: "all .2s",
          }} onClick={() => setOpenIdx(isOpen ? null : idx)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{
                  color: accent, fontWeight: 800, fontSize: 15,
                  fontFamily: "'Courier New', monospace",
                }}>
                  {titleText}
                </span>
                <span style={{ color: C.sub, fontSize: 13, marginLeft: 8 }}>
                  {titleSub}
                </span>
              </div>
              <span style={{
                fontSize: 18, color: C.sub,
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform .2s",
                display: "inline-block",
              }}>
                ▼
              </span>
            </div>

            {/* Syntax template always visible */}
            <pre style={{
              margin: "10px 0 0",
              padding: 12, borderRadius: 8,
              background: codeBg, color: codeColor,
              fontSize: 13, fontFamily: "'Courier New', monospace",
              overflowX: "auto", lineHeight: 1.6,
            }}>
              {syntaxText}
            </pre>

            {/* Expanded content */}
            {isOpen && (
              <div style={{ marginTop: 12, animation: "fadeIn .2s ease-out" }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: C.green,
                    textTransform: "uppercase", letterSpacing: 1,
                  }}>
                    예시
                  </span>
                  <pre style={{
                    margin: "6px 0 0",
                    padding: 12, borderRadius: 8,
                    background: C.greenLight, color: "#065F46",
                    fontSize: 13, fontFamily: "'Courier New', monospace",
                    overflowX: "auto", lineHeight: 1.6,
                  }}>
                    {exampleText}
                  </pre>
                </div>
                <div style={{
                  padding: 12, borderRadius: 8,
                  background: accentLight, color: C.text,
                  fontSize: 13, lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}>
                  {explainText}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB B: CODE TRACER ───
function CodeTracer({ mobile }) {
  const [exIdx, setExIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState("pseudo"); // "pseudo" | "python"
  const timerRef = useRef(null);

  const isPy = lang === "python";
  const accent = isPy ? C.blue : C.purple;
  const accentLight = isPy ? C.blueLight : C.purpleLight;
  const codeBg = isPy ? "#0F172A" : "#1E1B4B";
  const codeColor = isPy ? "#93C5FD" : "#E0E7FF";

  const example = TRACER_EXAMPLES[exIdx];
  const codeLines = isPy ? (example.pythonCode || example.code) : example.code;
  const stepsData = isPy ? (example.pythonSteps || example.steps) : example.steps;
  const current = stepsData[step];

  // Collect all var keys across all steps for table header
  const allVars = [];
  stepsData.forEach(s => {
    Object.keys(s.vars).forEach(k => {
      if (!allVars.includes(k)) allVars.push(k);
    });
  });

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [exIdx, lang]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= stepsData.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, stepsData.length]);

  const traceRows = stepsData.slice(0, step + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Language toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          display: "flex", borderRadius: 10, overflow: "hidden",
          border: `1.5px solid ${C.border}`,
        }}>
          {[
            { key: "pseudo", label: "의사코드", icon: "📝" },
            { key: "python", label: "Python", icon: "🐍" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setLang(opt.key)} style={{
              padding: "7px 14px",
              border: "none",
              background: lang === opt.key
                ? (opt.key === "python" ? C.blue : C.purple)
                : C.white,
              color: lang === opt.key ? "#fff" : C.sub,
              fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: F,
              display: "flex", alignItems: "center", gap: 4,
              transition: "all .15s",
            }}>
              <span style={{ fontSize: 14 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Example selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TRACER_EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => { setExIdx(i); setPlaying(false); }} style={{
            padding: "6px 12px", borderRadius: 8,
            border: exIdx === i ? `2px solid ${accent}` : `1px solid ${C.border}`,
            background: exIdx === i ? accentLight : C.white,
            color: exIdx === i ? accent : C.sub,
            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F,
          }}>
            {i + 1}. {ex.title}
          </button>
        ))}
      </div>

      <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{example.description}</p>

      {/* Main layout */}
      <div style={{
        display: mobile ? "block" : "flex",
        gap: 16,
      }}>
        {/* Left: Code */}
        <div style={{
          flex: mobile ? undefined : "1 1 55%",
          marginBottom: mobile ? 12 : 0,
        }}>
          <div style={{
            background: codeBg, borderRadius: 12,
            padding: 16, overflow: "auto",
          }}>
            {codeLines.map((line, i) => {
              const isActive = current.line === i;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  padding: "4px 8px", borderRadius: 6,
                  background: isActive ? "rgba(250, 204, 21, 0.25)" : "transparent",
                  transition: "background .2s",
                }}>
                  <span style={{
                    color: "#6B7280", fontSize: 11,
                    width: 24, textAlign: "right", marginRight: 12,
                    fontFamily: "'Courier New', monospace",
                    userSelect: "none",
                  }}>
                    {i + 1}
                  </span>
                  {isActive && (
                    <span style={{
                      color: "#FACC15", fontSize: 12, marginRight: 6,
                      fontWeight: 800,
                    }}>
                      ▶
                    </span>
                  )}
                  <span style={{
                    color: isActive ? "#FACC15" : codeColor,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13, fontWeight: isActive ? 700 : 400,
                    whiteSpace: "pre",
                  }}>
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Trace Table */}
        <div style={{
          flex: mobile ? undefined : "1 1 45%",
        }}>
          <div style={{
            ...cardS, padding: 0, overflow: "hidden",
          }}>
            <div style={{
              background: accentLight, padding: "8px 12px",
              fontWeight: 800, fontSize: 13, color: accent,
            }}>
              추적표 (Trace Table)
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: 13, fontFamily: "'Courier New', monospace",
              }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    {allVars.map(v => (
                      <th key={v} style={thStyle}>{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {traceRows.map((row, ri) => {
                    const isLast = ri === traceRows.length - 1;
                    return (
                      <tr key={ri} style={{
                        background: isLast ? "#FEF9C3" : (ri % 2 === 0 ? "#FAFAFA" : C.white),
                        fontWeight: isLast ? 700 : 400,
                      }}>
                        <td style={tdStyle}>{ri + 1}</td>
                        {allVars.map(v => {
                          const val = row.vars[v];
                          const prevVal = ri > 0 ? traceRows[ri - 1].vars[v] : undefined;
                          const changed = isLast && val !== prevVal && val !== undefined;
                          return (
                            <td key={v} style={{
                              ...tdStyle,
                              color: changed ? C.blue : C.text,
                              position: "relative",
                            }}>
                              {val !== undefined ? String(val) : "-"}
                              {changed && (
                                <span style={{
                                  position: "absolute", right: 4, top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: 9, color: C.blue,
                                }}>
                                  ←new
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Explain */}
      <div style={{
        ...cardS, padding: 12,
        background: "#FEF3C7", borderColor: C.orange,
        display: "flex", alignItems: "flex-start", gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>💬</span>
        <div>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
            {current.explain}
          </span>
          <span style={{
            display: "block", fontSize: 11, color: C.sub, marginTop: 4,
          }}>
            스텝 {step + 1} / {stepsData.length}
          </span>
        </div>
      </div>

      {/* Output */}
      <div style={{
        ...cardS, padding: 12,
        background: "#F0FDF4", borderColor: C.green,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
        }}>
          <span style={{ fontSize: 14 }}>📤</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.green }}>Output</span>
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 13,
          color: current.output.length > 0 ? C.text : C.light,
          minHeight: 20,
        }}>
          {current.output.length > 0
            ? current.output.map((o, i) => <div key={i}>{String(o)}</div>)
            : "(아직 출력 없음)"
          }
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
      }}>
        <TracerBtn label="↺ 처음" onClick={() => { setStep(0); setPlaying(false); }} />
        <TracerBtn label="◀ 이전" onClick={() => { setStep(s => Math.max(0, s - 1)); setPlaying(false); }}
          disabled={step === 0} />
        <TracerBtn label="▶ 다음" onClick={() => { setStep(s => Math.min(stepsData.length - 1, s + 1)); setPlaying(false); }}
          disabled={step === stepsData.length - 1} />
        <TracerBtn
          label={playing ? "⏸ 일시정지" : "▶▶ 자동"}
          onClick={() => {
            if (step >= stepsData.length - 1) setStep(0);
            setPlaying(p => !p);
          }}
          highlight
        />
      </div>
    </div>
  );
}

function TracerBtn({ label, onClick, disabled, highlight }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 16px", borderRadius: 10,
      border: highlight ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
      background: disabled ? "#F3F4F6" : highlight ? C.purpleLight : C.white,
      color: disabled ? C.light : highlight ? C.purple : C.text,
      fontWeight: 700, fontSize: 13,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: F, transition: "all .15s",
    }}>
      {label}
    </button>
  );
}

const thStyle = {
  padding: "8px 12px", textAlign: "left",
  borderBottom: `2px solid ${C.border}`,
  background: "#F9FAFB", color: C.sub,
  fontSize: 12, fontWeight: 700,
};

const tdStyle = {
  padding: "6px 12px",
  borderBottom: `1px solid ${C.border}`,
  color: C.text,
};

// ─── TAB C: CODE COMPARE ───
function CodeCompare({ mobile }) {
  const [compIdx, setCompIdx] = useState(0);
  const [hoverLine, setHoverLine] = useState(null);

  const comp = COMPARISONS[compIdx];

  const isLineHighlighted = (side, lineIdx) => {
    if (hoverLine === null) return false;
    return comp.lineMap.some(([p, py]) =>
      (hoverLine.side === "pseudo" && p === hoverLine.idx && ((side === "pseudo" && p === lineIdx) || (side === "python" && py === lineIdx))) ||
      (hoverLine.side === "python" && py === hoverLine.idx && ((side === "python" && py === lineIdx) || (side === "pseudo" && p === lineIdx)))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Topic selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {COMPARISONS.map((c, i) => (
          <button key={i} onClick={() => { setCompIdx(i); setHoverLine(null); }} style={{
            padding: "6px 12px", borderRadius: 8,
            border: compIdx === i ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
            background: compIdx === i ? C.tealLight : C.white,
            color: compIdx === i ? C.teal : C.sub,
            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: F,
          }}>
            {c.title}
          </button>
        ))}
      </div>

      {/* Side by side */}
      <div style={{
        display: mobile ? "block" : "flex",
        gap: 12,
      }}>
        {/* Pseudocode side */}
        <div style={{ flex: 1, marginBottom: mobile ? 12 : 0 }}>
          <div style={{
            background: C.purpleLight, padding: "8px 12px",
            borderRadius: "12px 12px 0 0",
            fontWeight: 800, fontSize: 13, color: C.purple,
            textAlign: "center",
          }}>
            의사코드 (Pseudocode)
          </div>
          <div style={{
            background: "#1E1B4B", borderRadius: "0 0 12px 12px",
            padding: 12,
          }}>
            {comp.pseudo.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverLine({ side: "pseudo", idx: i })}
                onMouseLeave={() => setHoverLine(null)}
                style={{
                  padding: "3px 8px", borderRadius: 4,
                  background: isLineHighlighted("pseudo", i) ? "rgba(139, 92, 246, 0.3)" : "transparent",
                  transition: "background .15s",
                  cursor: "pointer",
                }}
              >
                <span style={{
                  color: "#6B7280", fontSize: 11, marginRight: 10,
                  fontFamily: "'Courier New', monospace",
                  userSelect: "none", display: "inline-block", width: 18,
                  textAlign: "right",
                }}>
                  {i + 1}
                </span>
                <span style={{
                  color: isLineHighlighted("pseudo", i) ? "#C4B5FD" : "#E0E7FF",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13, fontWeight: isLineHighlighted("pseudo", i) ? 700 : 400,
                  whiteSpace: "pre",
                }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Python side */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: C.blueLight, padding: "8px 12px",
            borderRadius: "12px 12px 0 0",
            fontWeight: 800, fontSize: 13, color: C.blue,
            textAlign: "center",
          }}>
            Python
          </div>
          <div style={{
            background: "#0F172A", borderRadius: "0 0 12px 12px",
            padding: 12,
          }}>
            {comp.python.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverLine({ side: "python", idx: i })}
                onMouseLeave={() => setHoverLine(null)}
                style={{
                  padding: "3px 8px", borderRadius: 4,
                  background: isLineHighlighted("python", i) ? "rgba(59, 130, 246, 0.3)" : "transparent",
                  transition: "background .15s",
                  cursor: "pointer",
                }}
              >
                <span style={{
                  color: "#6B7280", fontSize: 11, marginRight: 10,
                  fontFamily: "'Courier New', monospace",
                  userSelect: "none", display: "inline-block", width: 18,
                  textAlign: "right",
                }}>
                  {i + 1}
                </span>
                <span style={{
                  color: isLineHighlighted("python", i) ? "#93C5FD" : "#CBD5E1",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13, fontWeight: isLineHighlighted("python", i) ? 700 : 400,
                  whiteSpace: "pre",
                }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        ...cardS, padding: 12, background: C.tealLight,
        borderColor: C.teal, fontSize: 13, color: C.text,
      }}>
        💡 줄 위에 마우스를 올리면 양쪽에서 대응하는 줄이 하이라이트됩니다
      </div>
    </div>
  );
}
