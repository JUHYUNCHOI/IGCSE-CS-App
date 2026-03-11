import { useState, useEffect } from "react";
import { C, F, cardS, btnS } from "../constants";
import { useIsMobile } from "../hooks";
import syllabusData from "../data/syllabus_topics.json";
import { getQuestionsBySubtopic } from "../data/quizData";
import QuizQuestion from "./QuizQuestion";
import { TEACHING_SECTIONS } from "../data/teachingContent";
import { renderExplain, splitExplainPages } from "../utils/explainRenderer";

// ─── TEACHING CONTENT: Korean translations + teaching notes ───
export const TC = {
  "1.1": { nameKo: "진법", concepts: [
    { en: "Binary, denary, hexadecimal number systems", ko: "2진법, 10진법, 16진법 체계", teach: "컴퓨터는 0과 1(2진법)만 이해합니다. 우리는 10진법을 쓰고, 16진법은 2진수를 짧게 표현할 때 사용합니다. 16진법은 0-9와 A-F를 씁니다.", examTip: "시험 빈출: '왜 16진수를 사용하는가?' → 2진수보다 짧고 읽기 쉬움, 메모리 주소/색상 코드에 활용" },
    { en: "Conversions between number systems (up to 16-bit)", ko: "진법 간 변환 (최대 16비트)", teach: "2진→10진: 자릿값 더하기. 10진→2진: 2로 계속 나누기. 2진↔16진: 4비트씩 묶기/풀기. 반드시 풀이 과정을 보여야 합니다.", examTip: "풀이 과정(working)을 반드시 보여야 합점! 답만 쓰면 감점" },
    { en: "Binary addition (8-bit) and overflow", ko: "2진수 덧셈 (8비트)과 오버플로우", teach: "2진수 덧셈: 0+0=0, 0+1=1, 1+1=10(올림), 1+1+1=11(올림). 8비트를 넘기면 오버플로우(overflow) 발생 → 결과가 부정확해짐." },
    { en: "Logical binary shifts (left and right)", ko: "논리 이진 시프트 (좌/우)", teach: "왼쪽 시프트: 모든 비트를 왼쪽으로 → 값이 2배. 오른쪽 시프트: 오른쪽으로 → 값이 절반. 빈자리는 0으로 채움. 시프트된 비트는 사라짐." },
    { en: "Two's complement (8-bit, positive and negative)", ko: "2의 보수 (8비트, 양수와 음수)", teach: "음수를 2진법으로 표현하는 방법. 맨 앞 비트가 1이면 음수. 변환법: 모든 비트 뒤집기 → 1 더하기. 예: -5 → 00000101 뒤집기 → 11111010 → +1 → 11111011" },
  ]},
  "1.2": { nameKo: "텍스트, 사운드, 이미지", concepts: [
    { en: "Character sets: ASCII and Unicode", ko: "문자 집합: ASCII와 Unicode", teach: "ASCII: 7비트, 128개 문자 (영문+숫자+기호). Unicode: 16비트 이상, 전 세계 모든 문자 지원 (한국어 포함). Unicode가 더 많은 저장 공간이 필요하지만 다국어를 지원합니다." },
    { en: "Sound representation: sample rate and sample resolution", ko: "사운드 표현: 샘플링 레이트와 해상도", teach: "소리는 아날로그 → 디지털로 변환. 샘플링 레이트: 1초에 몇 번 측정하는지 (Hz). 샘플 해상도: 각 측정값의 정밀도 (비트). 둘 다 높을수록 음질↑ 파일 크기↑." },
    { en: "Image representation: resolution and colour depth", ko: "이미지 표현: 해상도와 색 깊이", teach: "이미지 = 픽셀의 격자. 해상도: 가로×세로 픽셀 수. 색 깊이: 1픽셀당 비트 수 (1비트=흑백, 8비트=256색, 24비트=1600만색). 파일 크기 = 해상도 × 색 깊이." },
  ]},
  "1.3": { nameKo: "데이터 저장과 압축", concepts: [
    { en: "Data storage units: bit, nibble, byte, KiB, MiB, GiB, TiB, PiB, EiB", ko: "저장 단위: 비트→니블→바이트→KiB→MiB→GiB→TiB", teach: "1 bit = 0 또는 1. 1 nibble = 4 bits. 1 byte = 8 bits. 이후 1024배씩: KiB(1024B), MiB, GiB, TiB. 시험에서 1024 기반 계산이 나옵니다." },
    { en: "File size calculations (image and sound)", ko: "파일 크기 계산 (이미지/사운드)", teach: "이미지: 가로×세로×색깊이 (비트). 사운드: 샘플레이트×해상도×초×채널수 (비트). 비트→바이트: ÷8. 바이트→KiB: ÷1024.", examTip: "계산 문제 빈출! 단위 변환을 정확히 할 것" },
    { en: "Purpose of compression", ko: "압축의 목적", teach: "파일 크기를 줄이는 것. 이유: 저장 공간 절약, 전송 시간 단축, 대역폭 절약." },
    { en: "Lossy vs lossless compression (including RLE)", ko: "손실 압축 vs 무손실 압축 (RLE 포함)", teach: "무손실(Lossless): 원본 완벽 복원 가능. RLE가 대표적 (연속 데이터를 '값×횟수'로 표현). 손실(Lossy): 불필요한 데이터 제거 → 원본 복원 불가. JPEG/MP3 등." },
  ]},
  "2.1": { nameKo: "데이터 전송 방식", concepts: [
    { en: "Packets: header, payload, trailer", ko: "패킷: 헤더, 페이로드, 트레일러", teach: "데이터를 작은 조각(패킷)으로 나눠서 전송. 헤더: 보내는/받는 주소, 순서번호. 페이로드: 실제 데이터. 트레일러: 오류 검출 코드." },
    { en: "Packet switching process", ko: "패킷 스위칭 과정", teach: "데이터를 패킷으로 분할 → 각 패킷이 다른 경로로 전송 가능 → 도착 후 올바른 순서로 재조립. 장점: 효율적, 한 경로 문제시 다른 경로 사용 가능." },
    { en: "Serial, parallel, simplex, half-duplex, full-duplex", ko: "직렬/병렬, 단방향/반이중/전이중", teach: "직렬(Serial): 한 줄로 순서대로. 병렬(Parallel): 여러 줄로 동시에. 단방향(Simplex): 한 방향만. 반이중(Half-duplex): 양방향이지만 번갈아. 전이중(Full-duplex): 양방향 동시." },
    { en: "USB interface", ko: "USB 인터페이스", teach: "Universal Serial Bus. 다양한 기기를 컴퓨터에 연결하는 표준 방식. 핫 플러그(꽂으면 바로 사용), 직렬 전송, 다양한 장치 호환." },
  ]},
  "2.2": { nameKo: "오류 검출 방법", concepts: [
    { en: "Parity check (odd and even), parity byte/block", ko: "패리티 검사 (홀수/짝수), 패리티 바이트", teach: "1의 개수를 세서 오류 확인. 짝수 패리티: 1의 개수가 짝수가 되도록 패리티 비트 추가. 홀수 패리티: 홀수가 되도록. 패리티 블록: 가로+세로로 검사하면 오류 위치까지 찾을 수 있음." },
    { en: "Checksum and echo check", ko: "체크섬과 에코 검사", teach: "체크섬: 데이터 값들의 합을 전송하여 비교. 에코 검사: 받은 데이터를 다시 보내서 원본과 비교." },
    { en: "Check digit (ISBN, barcodes)", ko: "검사 숫자 (ISBN, 바코드)", teach: "마지막 자리 숫자가 앞 숫자들로 계산한 값과 일치하는지 확인. ISBN이나 바코드에 사용. 입력 오류를 잡아냄." },
    { en: "Automatic repeat query (ARQ)", ko: "자동 재전송 요청 (ARQ)", teach: "오류가 감지되면 자동으로 재전송 요청. 확인 응답(ACK) 없으면 타임아웃 후 재전송." },
  ]},
  "2.3": { nameKo: "암호화", concepts: [
    { en: "Purpose of encryption", ko: "암호화의 목적", teach: "데이터를 읽을 수 없는 형태로 변환하여 보안 유지. 평문(plaintext) → 암호문(ciphertext). 키(key)가 있어야 복호화 가능." },
    { en: "Symmetric vs asymmetric encryption", ko: "대칭 암호화 vs 비대칭 암호화", teach: "대칭: 암호화/복호화에 같은 키 사용 (빠르지만 키 공유 문제). 비대칭: 공개키로 암호화, 개인키로 복호화 (느리지만 안전)." },
    { en: "Public and private keys", ko: "공개키와 개인키", teach: "공개키: 누구나 볼 수 있음. 데이터 암호화에 사용. 개인키: 소유자만 가지고 있음. 복호화에 사용. 이 두 키는 수학적으로 연결되어 있음." },
  ]},
  "3.1": { nameKo: "컴퓨터 구조", concepts: [
    { en: "CPU role and microprocessor", ko: "CPU의 역할과 마이크로프로세서", teach: "CPU = 컴퓨터의 두뇌. 모든 명령어를 처리하고 계산 수행. 마이크로프로세서 = 하나의 칩에 CPU 기능이 들어간 것." },
    { en: "Von Neumann architecture: ALU, CU, PC, MAR, MDR, CIR, ACC", ko: "폰 노이만 구조: ALU, CU, PC, MAR, MDR, CIR, ACC", teach: "ALU: 계산(산술+논리). CU: 명령 해석/제어. PC: 다음 명령 주소. MAR: 메모리 주소 저장. MDR: 메모리 데이터 저장. CIR: 현재 명령어. ACC: 계산 결과 임시 저장.", examTip: "각 레지스터의 역할을 정확히 알아야 함! 매년 출제" },
    { en: "Buses: address, data, control", ko: "버스: 주소 버스, 데이터 버스, 제어 버스", teach: "버스 = 데이터가 이동하는 통로. 주소 버스: CPU→메모리 (주소 전달, 단방향). 데이터 버스: 양방향 (데이터 이동). 제어 버스: 제어 신호 (읽기/쓰기 등)." },
    { en: "Fetch-decode-execute (FDE) cycle", ko: "인출-해독-실행 사이클", teach: "Fetch: PC의 주소 → MAR → 메모리에서 명령어 → MDR → CIR. PC+1. Decode: CU가 CIR의 명령어 해석. Execute: 명령어 실행 (계산이면 ALU 사용).", examTip: "FDE 사이클의 각 단계에서 어떤 레지스터가 사용되는지 설명할 수 있어야 함" },
    { en: "Cores, cache, clock speed and performance", ko: "코어, 캐시, 클럭 속도와 성능", teach: "코어 수↑: 동시에 더 많은 작업 가능. 캐시 크기↑: 자주 쓰는 데이터 빠르게 접근. 클럭 속도↑: 초당 더 많은 명령 처리. 세 가지 모두 성능에 영향." },
    { en: "Instruction set", ko: "명령어 집합", teach: "CPU가 이해할 수 있는 모든 명령어의 목록. 기계어로 되어 있음. CPU마다 다른 명령어 집합을 가질 수 있음." },
    { en: "Embedded systems", ko: "임베디드 시스템", teach: "특정 기능만 수행하는 내장 컴퓨터. 예: 세탁기, 자동차, 전자레인지. 범용 컴퓨터와 달리 하나의 목적만 수행." },
  ]},
  "3.2": { nameKo: "입출력 장치", concepts: [
    { en: "Input: barcode scanner, digital camera, keyboard, microphone, mouse, QR scanner, touch screen (resistive/capacitive/infra-red), 2D/3D scanners", ko: "입력장치 목록", teach: "입력장치 = 컴퓨터에 데이터를 넣는 장치. 터치스크린 3종: 저항막(resistive, 압력감지), 정전용량(capacitive, 전기감지), 적외선(infra-red, 빛 차단 감지). 각각의 작동 원리를 알아야 합니다." },
    { en: "Output: actuator, DLP projector, inkjet/laser printer, LED/LCD screen, LCD projector, speaker, 3D printer", ko: "출력장치 목록", teach: "출력장치 = 컴퓨터가 결과를 보여주는 장치. 프린터 2종: 잉크젯(잉크 분사, 느리지만 고품질), 레이저(토너, 빠르고 대량 인쇄). 3D 프린터: 층층이 쌓아서 물체 제작." },
    { en: "Sensors: acoustic, accelerometer, flow, gas, humidity, infra-red, level, light, magnetic field, moisture, pH, pressure, proximity, temperature", ko: "센서 종류 (14가지)", teach: "센서 = 물리적 환경을 측정하는 장치. 시험에서는 특정 상황에 어떤 센서를 쓰는지 묻습니다. 예: 온실→온도+습도+토양수분 센서, 보안→적외선+압력 센서." },
  ]},
  "3.3": { nameKo: "데이터 저장", concepts: [
    { en: "Primary storage: RAM and ROM", ko: "주기억장치: RAM과 ROM", teach: "RAM: 휘발성(전원 끄면 사라짐), 읽기/쓰기 가능, 실행 중인 프로그램/데이터 저장. ROM: 비휘발성, 읽기 전용, 부팅 명령어 저장." },
    { en: "Secondary storage: magnetic (HDD), optical (CD/DVD/Blu-ray), solid-state (SSD/SD/USB)", ko: "보조기억장치: 자기/광학/반도체", teach: "자기(HDD): 대용량, 저렴, 움직이는 부품→고장 가능. 광학(CD/DVD): 레이저로 읽기, 배포용. 반도체(SSD): 빠르고 충격에 강하지만 비쌈." },
    { en: "Virtual memory", ko: "가상 메모리", teach: "RAM이 부족할 때 보조기억장치의 일부를 RAM처럼 사용. 장점: 더 많은 프로그램 실행 가능. 단점: 실제 RAM보다 훨씬 느림 → 디스크 스래싱." },
    { en: "Cloud storage vs local storage", ko: "클라우드 vs 로컬 저장", teach: "클라우드: 인터넷 서버에 저장 (어디서든 접근, 백업 자동, 인터넷 필요). 로컬: 자기 컴퓨터에 저장 (빠름, 인터넷 불필요, 물리적 손상 위험)." },
  ]},
  "3.4": { nameKo: "네트워크 하드웨어", concepts: [
    { en: "Network interface card (NIC)", ko: "네트워크 인터페이스 카드", teach: "컴퓨터를 네트워크에 연결하는 하드웨어. 각 NIC에는 고유한 MAC 주소가 있음. 유선(이더넷) 또는 무선(Wi-Fi)." },
    { en: "MAC address structure and purpose", ko: "MAC 주소의 구조와 목적", teach: "48비트 주소, 16진수로 표현 (예: A1:B2:C3:D4:E5:F6). 앞 24비트: 제조사. 뒤 24비트: 고유 번호. NIC에 영구적으로 할당됨." },
    { en: "IP address: static/dynamic, IPv4/IPv6", ko: "IP 주소: 정적/동적, IPv4/IPv6", teach: "IP주소 = 네트워크상의 주소. 정적: 고정(서버에 사용). 동적: DHCP가 자동 할당. IPv4: 32비트(xxx.xxx.xxx.xxx). IPv6: 128비트(주소 부족 해결)." },
    { en: "Router role in a network", ko: "라우터의 역할", teach: "패킷을 가장 효율적인 경로로 전달하는 장치. 라우팅 테이블 사용. 서로 다른 네트워크를 연결." },
  ]},
  "4.1": { nameKo: "소프트웨어와 인터럽트", concepts: [
    { en: "System software vs application software", ko: "시스템 소프트웨어 vs 응용 소프트웨어", teach: "시스템: 컴퓨터 자체를 관리 (OS, 유틸리티, 드라이버). 응용: 사용자 작업 수행 (워드, 게임, 브라우저)." },
    { en: "OS functions: file management, interrupt handling, interface, peripherals/drivers, memory, multitasking, security, user accounts", ko: "OS 기능 8가지", teach: "운영체제가 하는 일: 파일 관리, 인터럽트 처리, 사용자 인터페이스 제공, 주변장치/드라이버 관리, 메모리 관리, 멀티태스킹, 보안, 사용자 계정 관리." },
    { en: "Hardware → firmware → OS → applications", ko: "하드웨어 → 펌웨어 → OS → 응용프로그램", teach: "계층 구조. 하드웨어 위에 펌웨어(ROM에 저장된 소프트웨어), 그 위에 OS, 그 위에 응용프로그램이 동작합니다." },
    { en: "Interrupts and interrupt service routines", ko: "인터럽트와 인터럽트 서비스 루틴", teach: "인터럽트 = CPU에게 '지금 하던 거 멈추고 이것 먼저 해' 라는 신호. FDE 사이클 끝에 인터럽트 확인. ISR: 인터럽트를 처리하는 프로그램." },
  ]},
  "4.2": { nameKo: "프로그래밍 언어와 번역기", concepts: [
    { en: "High-level vs low-level languages", ko: "고급 언어 vs 저급 언어", teach: "고급(Python, Java): 사람이 읽기 쉬움, 기계 독립적, 번역 필요. 저급(기계어, 어셈블리): CPU가 직접 이해, 하드웨어 의존적, 빠름." },
    { en: "Assembly language and assemblers", ko: "어셈블리 언어와 어셈블러", teach: "어셈블리 = 기계어에 가까운 저급 언어. 니모닉(LDA, STO, ADD 등) 사용. 어셈블러가 기계어로 번역." },
    { en: "Compiler vs interpreter", ko: "컴파일러 vs 인터프리터", teach: "컴파일러: 전체 코드를 한번에 번역 → 실행 파일 생성 (빠른 실행, 배포에 적합). 인터프리터: 한 줄씩 번역+실행 (디버깅에 유리, 실행 느림).", examTip: "비교 문제 자주 출제! 장단점을 표로 정리해두세요" },
    { en: "IDE features: code editor, runtime environment, translator, error diagnostics, auto-completion, auto-correction, prettyprint", ko: "IDE 기능 7가지", teach: "IDE = 통합 개발 환경. 코드 편집기, 실행 환경, 번역기, 오류 진단, 자동 완성, 자동 수정, 코드 정렬(prettyprint). 시험에서 각 기능의 역할을 설명해야 합니다." },
  ]},
  "5.1": { nameKo: "인터넷과 웹", concepts: [
    { en: "Internet vs world wide web", ko: "인터넷 vs 월드 와이드 웹", teach: "인터넷 = 전 세계 컴퓨터를 연결하는 네트워크. WWW = 인터넷 위에서 동작하는 웹페이지 시스템. 인터넷은 인프라, 웹은 서비스." },
    { en: "URL structure", ko: "URL 구조", teach: "프로토콜://도메인/경로. 예: https://www.example.com/page. 프로토콜(http/https), 도메인(사이트 이름), 경로(페이지 위치)." },
    { en: "HTTP vs HTTPS", ko: "HTTP vs HTTPS", teach: "HTTP: 암호화 없이 데이터 전송. HTTPS: SSL/TLS로 암호화하여 전송 → 보안 강화. 자물쇠 아이콘으로 확인 가능." },
    { en: "Web browser functions", ko: "웹 브라우저 기능", teach: "HTML 렌더링, JS 실행, 주소표시줄, 즐겨찾기, 히스토리, 쿠키 관리, 팝업 차단 등." },
    { en: "How web pages are retrieved: browser → DNS → IP → web server → HTML", ko: "웹페이지 로딩 과정", teach: "1) 브라우저에 URL 입력 2) DNS가 도메인→IP 주소 변환 3) IP로 웹 서버에 요청 4) 서버가 HTML 반환 5) 브라우저가 렌더링.", examTip: "이 과정을 순서대로 설명하는 문제 자주 출제" },
    { en: "Cookies: session and persistent", ko: "쿠키: 세션 쿠키와 영구 쿠키", teach: "쿠키 = 웹사이트가 브라우저에 저장하는 작은 데이터. 세션 쿠키: 브라우저 닫으면 삭제 (로그인 유지). 영구 쿠키: 만료일까지 유지 (설정 기억)." },
  ]},
  "5.2": { nameKo: "디지털 화폐", concepts: [
    { en: "Concept of digital currency", ko: "디지털 화폐의 개념", teach: "물리적 형태 없이 전자적으로만 존재하는 화폐. 비트코인이 대표적. 중앙은행 없이 분산 네트워크로 운영." },
    { en: "Blockchain and how it tracks transactions", ko: "블록체인과 거래 추적 방식", teach: "블록체인 = 거래 기록의 연결 목록. 각 블록에 여러 거래 기록 + 이전 블록의 해시값. 수정이 거의 불가능(변조 방지). 모든 참여자가 같은 사본을 가짐." },
  ]},
  "5.3": { nameKo: "사이버 보안", concepts: [
    { en: "Threats: brute-force, data interception, DDoS, hacking, malware (virus/worm/Trojan/spyware/adware/ransomware), pharming, phishing, social engineering", ko: "보안 위협 종류", teach: "브루트포스: 비밀번호 무작위 대입. DDoS: 대량 요청으로 서버 마비. 피싱: 가짜 이메일/사이트로 정보 탈취. 멀웨어 6종: 바이러스(자기복제), 웜(네트워크 전파), 트로이(위장), 스파이웨어(감시), 애드웨어(광고), 랜섬웨어(파일 암호화+몸값). 파밍: DNS 조작. 소셜 엔지니어링: 사람을 속여서 정보 획득.", examTip: "각 위협의 정의와 차이점을 정확히 구분할 것!" },
    { en: "Solutions: access levels, anti-malware, authentication, software updates, checking URLs, firewalls, privacy settings, proxy servers, SSL", ko: "보안 대책 종류", teach: "접근 권한 설정, 안티멀웨어 소프트웨어, 인증(비밀번호/2FA/생체인식), 소프트웨어 업데이트, URL 확인, 방화벽, 개인정보 설정, 프록시 서버, SSL 암호화. 각 대책이 어떤 위협에 효과적인지 연결하여 설명할 수 있어야 합니다." },
  ]},
  "6.1": { nameKo: "자동화 시스템", concepts: [
    { en: "Sensors, microprocessors, actuators in automated systems", ko: "센서→마이크로프로세서→액추에이터", teach: "자동화 시스템의 3단계: 1) 센서가 환경 측정 → 2) 마이크로프로세서가 데이터 분석/판단 → 3) 액추에이터가 물리적 동작 수행 (모터, 밸브 등)." },
    { en: "Advantages/disadvantages in: industry, transport, agriculture, weather, gaming, lighting, science", ko: "다양한 분야에서의 장단점", teach: "공통 장점: 24시간 작동, 정확성, 인건비 절약. 공통 단점: 초기 비용, 일자리 감소, 고장 시 위험. 각 분야별 구체적 예시를 알아야 합니다." },
  ]},
  "6.2": { nameKo: "로봇공학", concepts: [
    { en: "Definition and characteristics of robots", ko: "로봇의 정의와 특성", teach: "로봇 = 프로그래밍된 기계로, 자동으로 복잡한 동작을 수행. 특성: 센서 입력, 프로그래밍 가능, 반복 작업, 위험 환경에서 작동." },
    { en: "Roles in: industry, transport, agriculture, medicine, domestic, entertainment", ko: "산업/교통/농업/의학/가정/오락에서의 역할", teach: "산업: 조립/용접. 교통: 자율주행. 농업: 파종/수확. 의학: 수술 로봇. 가정: 청소 로봇. 오락: 게임/테마파크. 각 분야에서 장단점을 알아야 합니다." },
  ]},
  "6.3": { nameKo: "인공지능", concepts: [
    { en: "Definition of AI", ko: "AI의 정의", teach: "인공지능 = 컴퓨터가 인간처럼 학습하고 판단하는 능력. 패턴 인식, 자연어 처리, 의사결정 등." },
    { en: "Characteristics: data collection, rules, reasoning, learning/adapting", ko: "AI 특성: 데이터 수집, 규칙, 추론, 학습/적응", teach: "AI의 4가지 핵심 특성: 1) 대량 데이터 수집 2) 규칙 기반 처리 3) 논리적 추론 4) 경험으로부터 학습하고 적응." },
    { en: "Expert systems: knowledge base, rule base, inference engine, interface", ko: "전문가 시스템의 4가지 구성요소", teach: "지식 베이스: 전문 지식 저장. 규칙 베이스: IF-THEN 규칙. 추론 엔진: 규칙을 적용하여 결론 도출. 인터페이스: 사용자와 상호작용.", examTip: "전문가 시스템의 4가지 구성요소를 반드시 암기" },
    { en: "Machine learning basics", ko: "머신러닝 기초", teach: "대량의 데이터로부터 패턴을 스스로 학습. 명시적으로 프로그래밍하지 않아도 경험으로 성능 향상. 예: 이미지 인식, 추천 시스템." },
  ]},
  "7.1": { nameKo: "프로그램 개발과 설계", concepts: [
    { en: "Stages: analysis, design, coding, testing", ko: "개발 단계: 분석→설계→코딩→테스팅", teach: "분석: 문제 파악, 요구사항 정의. 설계: 해결 방법 계획 (순서도, 의사코드). 코딩: 실제 프로그램 작성. 테스팅: 오류 확인 및 수정." },
    { en: "Decomposition, structure diagrams, flowcharts, pseudocode", ko: "분해, 구조도, 순서도, 의사코드", teach: "분해(Decomposition): 큰 문제를 작은 부분으로 나누기. 구조도: 트리 형태로 시각화. 순서도: 도형으로 프로세스 표현. 의사코드: 프로그래밍 언어와 비슷한 설계 언어." },
    { en: "Sub-systems", ko: "서브시스템", teach: "분해된 각 부분을 서브시스템이라 함. 각각 독립적으로 개발/테스트 가능. 전체 시스템의 모듈." },
    { en: "Inputs, processes, outputs, storage", ko: "입력, 처리, 출력, 저장", teach: "모든 시스템은 이 4가지 요소로 구성. 입력: 사용자/센서로부터 데이터 받기. 처리: 데이터 가공. 출력: 결과 표시. 저장: 데이터 보관." },
  ]},
  "7.2": { nameKo: "표준 알고리즘", concepts: [
    { en: "Linear search", ko: "선형 검색", teach: "배열을 처음부터 끝까지 하나씩 확인하여 값을 찾는 알고리즘. 간단하지만 데이터가 많으면 느림. 정렬되지 않은 데이터에 사용." },
    { en: "Bubble sort", ko: "버블 정렬", teach: "인접한 두 값을 비교하여 순서가 틀리면 교환. 한 바퀴 돌면 가장 큰 값이 끝으로 이동. 교환이 없을 때까지 반복.", examTip: "버블 정렬 과정을 단계별로 보여주는 문제 자주 출제" },
    { en: "Totalling, counting, finding max/min/average", ko: "합계, 카운팅, 최대/최소/평균", teach: "합계: 변수에 계속 더하기. 카운팅: 조건 맞을 때마다 +1. 최대값: 현재 최대보다 크면 업데이트. 최소값: 반대. 평균: 합계÷개수." },
    { en: "Validation: range, length, type, presence, format, check digit", ko: "검증: 범위, 길이, 타입, 존재, 형식, 검사숫자", teach: "입력 데이터가 합리적인지 확인. 범위: 값이 범위 안에 있는지. 길이: 글자 수 확인. 타입: 숫자/문자 등 맞는지. 존재: 비어있지 않은지. 형식: 패턴 맞는지 (이메일 등)." },
    { en: "Verification: visual check, double entry", ko: "확인: 시각적 검사, 이중 입력", teach: "검증(validation)과 다름! 확인(verification) = 데이터가 정확하게 입력되었는지 확인. 시각적 검사: 사람이 눈으로 확인. 이중 입력: 두 번 입력하여 비교." },
    { en: "Test data: normal, abnormal, extreme, boundary", ko: "테스트 데이터: 정상, 비정상, 극단, 경계", teach: "정상: 예상대로 작동하는 데이터. 비정상: 거부되어야 하는 데이터. 극단: 허용 범위의 끝값. 경계: 허용/거부 경계의 값.", examTip: "예: 1-100 범위 → 정상:50, 비정상:'abc', 극단:1과100, 경계:0,1,100,101" },
    { en: "Trace tables", ko: "추적표", teach: "프로그램을 한 줄씩 실행하면서 변수 값의 변화를 기록하는 표. 디버깅과 프로그램 이해에 필수적인 도구.", examTip: "추적표 완성 문제는 거의 매년 출제! 의사코드 탭에서 연습 가능" },
    { en: "Error identification and correction", ko: "오류 식별과 수정", teach: "구문 오류(syntax error): 문법 틀림, 실행 안 됨. 논리 오류(logic error): 실행은 되지만 결과가 틀림. 런타임 오류: 실행 중 발생 (0으로 나누기 등)." },
  ]},
  "8.1": { nameKo: "프로그래밍 개념", concepts: [
    { en: "Variables and constants", ko: "변수와 상수", teach: "변수: 값이 바뀔 수 있는 저장 공간. 상수: 한번 정하면 바뀌지 않는 값. 상수를 쓰면 코드가 더 읽기 쉽고 안전합니다." },
    { en: "Data types: integer, real, char, string, Boolean", ko: "자료형: 정수, 실수, 문자, 문자열, 불리언", teach: "INTEGER: 정수(1, -5). REAL: 소수(3.14). CHAR: 문자 1개('A'). STRING: 문자열(\"Hello\"). BOOLEAN: TRUE/FALSE." },
    { en: "Input/output", ko: "입력/출력", teach: "INPUT: 사용자로부터 값 받기. OUTPUT: 화면에 값 표시. 의사코드 탭에서 자세히 확인 가능." },
    { en: "Sequence, selection (IF/CASE), iteration (count-controlled, pre/post-condition loops)", ko: "순차, 선택(IF/CASE), 반복(FOR/WHILE/REPEAT)", teach: "순차: 위에서 아래로 실행. 선택: 조건에 따라 다른 코드 실행. 반복: 같은 코드를 여러 번 실행. 이 3가지가 프로그래밍의 기본 구조.", examTip: "의사코드 탭에서 각 구조를 연습할 수 있습니다!" },
    { en: "String handling: length, substring, upper, lower", ko: "문자열 처리: 길이, 부분문자열, 대/소문자", teach: "LENGTH('Hello')=5. SUBSTRING('Hello',1,3)='Hel'. UPPER('hello')='HELLO'. LOWER('HELLO')='hello'." },
    { en: "Arithmetic operators: +, -, /, *, ^, MOD, DIV", ko: "산술 연산자", teach: "+더하기 -빼기 *곱하기 /나누기 ^거듭제곱. MOD: 나머지(7 MOD 3 = 1). DIV: 몫(7 DIV 3 = 2).", examTip: "MOD와 DIV는 시험 필수! 짝수/홀수 판별, 자릿수 추출에 활용" },
    { en: "Relational operators: =, <, <=, >, >=, <>", ko: "비교 연산자", teach: "= 같다, < 작다, <= 작거나 같다, > 크다, >= 크거나 같다, <> 같지 않다. 조건문에서 사용." },
    { en: "Logical operators: AND, OR, NOT", ko: "논리 연산자: AND, OR, NOT", teach: "AND: 둘 다 참이면 참. OR: 하나라도 참이면 참. NOT: 반대. 조건을 결합할 때 사용." },
    { en: "Nested statements (max 3 levels)", ko: "중첩문 (최대 3단계)", teach: "IF 안에 IF, FOR 안에 FOR 등. 시험에서는 최대 3단계까지 출제. 들여쓰기로 구분." },
    { en: "Procedures, functions, parameters (max 3)", ko: "프로시저, 함수, 매개변수 (최대 3개)", teach: "프로시저: 동작만 수행 (반환값 없음). 함수: 값을 반환. 매개변수: 호출할 때 전달하는 값. 시험에서는 매개변수 최대 3개." },
    { en: "Local and global variables", ko: "지역 변수와 전역 변수", teach: "지역: 함수/프로시저 안에서만 사용. 전역: 프로그램 전체에서 사용. 지역 변수를 쓰는 것이 더 좋은 프로그래밍 습관." },
    { en: "Library routines: MOD, DIV, ROUND, RANDOM", ko: "라이브러리 루틴: MOD, DIV, ROUND, RANDOM", teach: "미리 만들어진 기능. MOD(나머지), DIV(몫), ROUND(반올림), RANDOM(난수 생성). 직접 만들 필요 없이 바로 사용 가능." },
    { en: "Maintainable code: meaningful identifiers, comments", ko: "유지보수 가능한 코드: 의미 있는 이름, 주석", teach: "변수/함수에 의미 있는 이름 사용 (x 대신 totalScore). 주석으로 코드 설명. 다른 사람이 읽고 이해할 수 있게.", examTip: "시험에서 '이 코드를 어떻게 개선하겠는가?' 문제에 자주 등장" },
  ]},
  "8.2": { nameKo: "배열", concepts: [
    { en: "1D and 2D arrays", ko: "1차원 및 2차원 배열", teach: "1D: 한 줄의 값 목록 (ARRAY[1:5]). 2D: 행×열 표 형태 (ARRAY[1:3, 1:4]). 인덱스로 접근." },
    { en: "Reading/writing with iteration", ko: "반복문으로 배열 읽기/쓰기", teach: "FOR 루프로 배열의 모든 값을 순서대로 처리. 예: FOR i ← 1 TO 5 / OUTPUT arr[i] / NEXT i" },
    { en: "Nested iteration for 2D arrays", ko: "2D 배열의 중첩 반복", teach: "바깥 FOR = 행, 안쪽 FOR = 열. FOR r ← 1 TO 3 / FOR c ← 1 TO 4 / OUTPUT arr[r,c] / NEXT c / NEXT r" },
  ]},
  "8.3": { nameKo: "파일 처리", concepts: [
    { en: "Purpose of file storage", ko: "파일 저장의 목적", teach: "프로그램이 종료되어도 데이터를 유지하기 위해. RAM의 데이터는 전원이 꺼지면 사라지므로, 파일로 저장하여 영구 보관." },
    { en: "Open, close, read, write files", ko: "파일 열기, 닫기, 읽기, 쓰기", teach: "OPENFILE FOR READ/WRITE/APPEND → READFILE/WRITEFILE → CLOSEFILE. 의사코드 탭의 문법 카드에서 자세히 확인 가능." },
  ]},
  "9.1": { nameKo: "데이터베이스와 SQL", concepts: [
    { en: "Single-table database: fields, records, validation", ko: "단일 테이블 DB: 필드, 레코드, 검증", teach: "필드(field) = 열(column), 하나의 속성. 레코드(record) = 행(row), 하나의 항목. 검증: 데이터 타입, 길이, 범위 등." },
    { en: "Data types: text, character, Boolean, integer, real, date/time", ko: "DB 자료형 6가지", teach: "Text(긴 문자열), Character(짧은 문자), Boolean(예/아니오), Integer(정수), Real(실수), Date/Time(날짜/시간)." },
    { en: "Primary key", ko: "기본키", teach: "테이블에서 각 레코드를 유일하게 식별하는 필드. 중복 불가, 비어있으면 안 됨. 예: 학생번호, 주문번호." },
    { en: "SQL: SELECT, FROM, WHERE, ORDER BY (ASC/DESC), SUM, COUNT, AND, OR", ko: "SQL 명령어", teach: "SELECT 필드 FROM 테이블 WHERE 조건 ORDER BY 필드 ASC/DESC. 집계: SUM(합계), COUNT(개수). 조건 결합: AND, OR.", examTip: "SQL 쓰기 문제 반드시 출제! SELECT ... FROM ... WHERE ... ORDER BY ... 순서 암기" },
  ]},
  "10.1": { nameKo: "논리 게이트와 회로", concepts: [
    { en: "Logic gates: NOT, AND, OR, NAND, NOR, XOR", ko: "논리 게이트: NOT, AND, OR, NAND, NOR, XOR", teach: "NOT: 반전(0→1, 1→0). AND: 둘 다 1이면 1. OR: 하나라도 1이면 1. NAND=NOT AND. NOR=NOT OR. XOR: 서로 다르면 1." },
    { en: "Drawing logic circuits from: problem statement, logic expression, truth table", ko: "논리 회로 그리기", teach: "문제 설명/논리식/진리표에서 논리 회로를 그릴 수 있어야 합니다. 각 게이트의 기호를 정확히 알아야 합니다." },
    { en: "Completing truth tables (max 3 inputs, 1 output)", ko: "진리표 완성 (최대 3입력, 1출력)", teach: "입력 조합을 모두 나열하고 (2^n개), 각 조합의 출력을 계산. 3입력이면 8행. 중간 결과 열도 추가하면 풀기 쉬움.", examTip: "진리표 완성 + 논리식 쓰기가 짝으로 출제됨" },
    { en: "Writing logic expressions", ko: "논리식 쓰기", teach: "회로나 진리표에서 논리식(Boolean expression) 도출. AND, OR, NOT 사용. 예: X = (A AND B) OR (NOT C)." },
  ]},
};

// ─── HELPERS ───
const PAPER_COLORS = { 1: C.purple, 2: C.blue };
const PAPER_BG = { 1: C.purpleLight, 2: C.blueLight };

const flatSubtopics = syllabusData.topics.flatMap(t =>
  t.subtopics.map(st => ({ ...st, topicId: t.id, topicName: t.name, paper: t.paper }))
);

// ─── MAIN COMPONENT ───
export default function TeachingMode({ initialSubtopic }) {
  const [phase, setPhase] = useState("overview");
  const [topicId, setTopicId] = useState(null);
  const [subIdx, setSubIdx] = useState(0);
  const mobile = useIsMobile();

  const startTopic = (tid, sIdx = 0) => {
    setTopicId(tid);
    setSubIdx(sIdx);
    setPhase("presenting");
    window.scrollTo(0, 0);
  };

  // Jump to specific subtopic from external navigation
  useEffect(() => {
    if (initialSubtopic) {
      const t = syllabusData.topics.find(tp =>
        tp.subtopics.some(st => st.id === initialSubtopic)
      );
      if (t) {
        const idx = t.subtopics.findIndex(st => st.id === initialSubtopic);
        startTopic(t.id, idx);
      }
    }
  }, [initialSubtopic]);

  const topic = topicId ? syllabusData.topics.find(t => t.id === topicId) : null;
  const subtopic = topic ? topic.subtopics[subIdx] : null;

  // Keyboard navigation
  useEffect(() => {
    if (phase !== "presenting") return;
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        setPhase("overview");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const goNext = () => {
    if (!topic) return;
    if (subIdx < topic.subtopics.length - 1) {
      setSubIdx(subIdx + 1);
      window.scrollTo(0, 0);
    } else {
      // Jump to next topic
      const nextTopic = syllabusData.topics.find(t => t.id === topicId + 1);
      if (nextTopic) {
        setTopicId(nextTopic.id);
        setSubIdx(0);
        window.scrollTo(0, 0);
      }
    }
  };

  const goPrev = () => {
    if (!topic) return;
    if (subIdx > 0) {
      setSubIdx(subIdx - 1);
      window.scrollTo(0, 0);
    } else {
      const prevTopic = syllabusData.topics.find(t => t.id === topicId - 1);
      if (prevTopic) {
        setTopicId(prevTopic.id);
        setSubIdx(prevTopic.subtopics.length - 1);
        window.scrollTo(0, 0);
      }
    }
  };

  if (phase === "overview") {
    return <TopicOverview onSelect={startTopic} mobile={mobile} />;
  }

  return (
    <div>
      <SlideView
        topic={topic}
        subtopic={subtopic}
        subIdx={subIdx}
        mobile={mobile}
        onBack={() => setPhase("overview")}
      />
      <SlideNav
        topic={topic}
        subIdx={subIdx}
        onPrev={goPrev}
        onNext={goNext}
        onJump={(i) => { setSubIdx(i); window.scrollTo(0, 0); }}
        onBack={() => setPhase("overview")}
        mobile={mobile}
      />
    </div>
  );
}

// ─── START GUIDE ───
function StartGuide({ mobile }) {
  const [expanded, setExpanded] = useState(true);
  const totalSub = syllabusData.topics.reduce((s, t) => s + t.subtopics.length, 0);
  const totalConcepts = syllabusData.topics.reduce((s, t) =>
    s + t.subtopics.reduce((s2, st) => s2 + st.key_concepts.length, 0), 0);
  const totalQuiz = syllabusData.topics.reduce((s, t) =>
    s + t.subtopics.reduce((s2, st) => s2 + getQuestionsBySubtopic(st.id).length, 0), 0);

  return (
    <div style={{
      ...cardS, marginBottom: 16,
      border: `2px solid ${C.purple}`, overflow: "hidden",
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", background: "none", border: "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: 0, cursor: "pointer", fontFamily: F,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
            시작 가이드 — IGCSE CS 0478
          </span>
        </div>
        <span style={{
          color: C.sub, fontSize: 14,
          transform: expanded ? "rotate(180deg)" : "rotate(0)",
          transition: "transform .2s", display: "inline-block",
        }}>▼</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 16 }}>
          {/* 시험 구조 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.purple, marginBottom: 8 }}>
              🎯 시험 구조
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8,
            }}>
              <div style={{ background: C.purpleLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.purple }}>
                  Paper 1: Computer Systems
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.7 }}>
                  105분 · 75점 · 전체의 50%<br/>
                  단답형 + 구조화 문제<br/>
                  토픽 1~6 (이론 중심)
                </div>
              </div>
              <div style={{ background: C.blueLight, borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.blue }}>
                  Paper 2: Algorithms & Programming
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.7 }}>
                  105분 · 75점 · 전체의 50%<br/>
                  단답형 + 구조화 + 15점 시나리오<br/>
                  토픽 7~10 (코딩/알고리즘)
                </div>
              </div>
            </div>
          </div>

          {/* 전체 통계 */}
          <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "토픽", value: `${syllabusData.topics.length}개`, icon: "📚" },
              { label: "소주제", value: `${totalSub}개`, icon: "📖" },
              { label: "핵심 개념", value: `${totalConcepts}개`, icon: "💡" },
              { label: "연습 문제", value: `${totalQuiz}문제`, icon: "📝" },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: "1 1 0", minWidth: 70,
                background: "#F9FAFB", borderRadius: 10, padding: "8px 10px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 16 }}>{stat.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 사용법 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.purple, marginBottom: 8 }}>
              🖥️ 사용법
            </div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.9 }}>
              <b style={{ color: C.text }}>1.</b> 아래 토픽 카드를 클릭하면 <b style={{ color: C.text }}>슬라이드 수업 모드</b>가 시작됩니다<br/>
              <b style={{ color: C.text }}>2.</b> 각 소주제별로 <b style={{ color: C.text }}>영문 개념 + 한국어 설명</b>이 표시됩니다<br/>
              <b style={{ color: C.text }}>3.</b> <b style={{ color: C.text }}>← → 화살표키</b>로 소주제 이동 (ESC로 목록 복귀)<br/>
              <b style={{ color: C.text }}>4.</b> 하단 <b style={{ color: C.text }}>📝 연습 문제</b> 버튼으로 퀴즈를 펼쳐서 학생들과 풀어보세요<br/>
              <b style={{ color: C.text }}>5.</b> <b style={{ color: C.text }}>정답 보기</b> 버튼으로 정답을 하나씩 공개할 수 있습니다
            </div>
          </div>

          {/* 추천 순서 */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.purple, marginBottom: 8 }}>
              📌 추천 수업 순서
            </div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.9 }}>
              <b style={{ color: C.text }}>첫 수업:</b> Topic 1 (Data representation) — 가장 기본이 되는 진법 변환부터<br/>
              <b style={{ color: C.text }}>Paper 1 순서:</b> 1 → 2 → 3 → 4 → 5 → 6 (순서대로 진행)<br/>
              <b style={{ color: C.text }}>Paper 2 순서:</b> 8 → 7 → 9 → 10 (프로그래밍 먼저 → 알고리즘 → DB → 논리)<br/>
              <b style={{ color: C.text }}>팁:</b> Paper 1과 2를 번갈아 가르치면 학생들이 덜 지루해합니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOPIC OVERVIEW ───
function TopicOverview({ onSelect, mobile }) {
  return (
    <div>
      <StartGuide mobile={mobile} />

      {syllabusData.papers.map(paper => {
        const topics = syllabusData.topics.filter(t => t.paper === paper.paper);
        const color = PAPER_COLORS[paper.paper];
        const bg = PAPER_BG[paper.paper];
        return (
          <div key={paper.paper} style={{ marginBottom: 20 }}>
            <div style={{
              background: color, borderRadius: 12,
              padding: "10px 16px", marginBottom: 10, color: "#fff",
            }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Paper {paper.paper}: {paper.name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {paper.duration_minutes}분 · {paper.marks}점 · {paper.weight_percent}%
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
              gap: 10,
            }}>
              {topics.map(topic => {
                const totalConcepts = topic.subtopics.reduce((sum, st) => sum + st.key_concepts.length, 0);
                const totalQuiz = topic.subtopics.reduce((sum, st) => sum + getQuestionsBySubtopic(st.id).length, 0);
                return (
                  <div key={topic.id} onClick={() => onSelect(topic.id)} style={{
                    ...cardS,
                    cursor: "pointer",
                    borderColor: color,
                    borderWidth: 2,
                    transition: "all .15s",
                    borderLeftWidth: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        background: bg, color: color,
                        width: 36, height: 36, borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 16, flexShrink: 0,
                      }}>
                        {topic.id}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
                          {topic.name}
                        </div>
                        <div style={{ fontSize: 12, color: C.sub }}>
                          {topic.subtopics.length}개 소주제 · {totalConcepts}개 개념
                          {totalQuiz > 0 && ` · ${totalQuiz}문제`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SLIDE VIEW ───
function SlideView({ topic, subtopic, subIdx, mobile, onBack }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeSec, setActiveSec] = useState(0);
  const [page, setPage] = useState(0);
  const [showPQ, setShowPQ] = useState(false);
  const [showConcepts, setShowConcepts] = useState(false);

  const color = PAPER_COLORS[topic.paper];
  const bg = PAPER_BG[topic.paper];
  const tc = TC[subtopic.id];
  const questions = getQuestionsBySubtopic(subtopic.id);
  const sections = TEACHING_SECTIONS[subtopic.id] || [];

  useEffect(() => {
    setShowQuiz(false);
    setActiveSec(0);
    setPage(0);
    setShowPQ(false);
    setShowConcepts(false);
  }, [subtopic.id]);

  const currentSection = sections[activeSec];
  const explainPages = currentSection ? splitExplainPages(currentSection.explain) : [];
  const totalPages = explainPages.length;
  const currentPageLines = explainPages[page] || [];

  // Widgets for current page
  const rawWidgets = currentSection?.widgets?.[page];
  const widgetList = rawWidgets ? (Array.isArray(rawWidgets) ? rawWidgets : [rawWidgets]) : [];

  // PageQuestions for current page
  const currentPQ = currentSection?.pageQuestions?.[page] || [];

  const goPage = (dir) => {
    const next = page + dir;
    if (next >= 0 && next < totalPages) {
      setPage(next);
      setShowPQ(false);
    }
  };

  const switchSection = (idx) => {
    setActiveSec(idx);
    setPage(0);
    setShowPQ(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        borderRadius: 12, padding: mobile ? 14 : 20,
        color: "#fff", marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: 8, padding: "6px 12px",
            color: "#fff", fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: F,
          }}>
            ← 목록
          </button>
          <span style={{ fontSize: 14, opacity: 0.8 }}>
            Paper {topic.paper} · Topic {topic.id}
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: mobile ? 13 : 14, opacity: 0.8 }}>
            {subtopic.id} · {subtopic.name}
          </div>
          <div style={{ fontSize: mobile ? 22 : 28, fontWeight: 800, marginTop: 4 }}>
            {tc ? tc.nameKo : subtopic.name}
          </div>
        </div>
      </div>

      {/* ── Section tabs (if multiple sections exist for this subtopic) ── */}
      {sections.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {sections.map((sec, i) => (
            <button key={sec.id} onClick={() => switchSection(i)} style={{
              ...btnS, flex: 1,
              background: i === activeSec ? color : bg,
              color: i === activeSec ? "#fff" : color,
              border: `2px solid ${color}`,
            }}>
              {sec.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Detailed Explain Pages ── */}
      {sections.length > 0 && totalPages > 0 && (
        <div style={{ ...cardS, marginBottom: 12, padding: mobile ? 16 : 24 }}>
          {/* Section title + page indicator */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14,
          }}>
            <div style={{ fontWeight: 800, fontSize: 16, color, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📖</span> {currentSection.title}
            </div>
            {totalPages > 1 && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: C.sub,
                background: "#F3F4F6", borderRadius: 20, padding: "4px 12px",
              }}>
                {page + 1} / {totalPages}
              </span>
            )}
          </div>

          {/* Main content: explain + widgets side by side */}
          <div style={{ display: mobile ? "block" : "flex", gap: 20 }}>
            {/* Explain text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {renderExplain(currentPageLines, color)}
            </div>

            {/* Widgets */}
            {widgetList.length > 0 && (
              <div style={{
                width: mobile ? "100%" : 320,
                marginTop: mobile ? 16 : 0,
                flexShrink: 0,
              }}>
                {widgetList.map((Widget, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <Widget />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Page Questions */}
          {currentPQ.length > 0 && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <button onClick={() => setShowPQ(!showPQ)} style={{
                ...btnS, width: "100%",
                background: showPQ ? C.green : C.greenLight,
                color: showPQ ? "#fff" : "#065F46",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                ✏️ 이 페이지 연습문제 ({currentPQ.length}문제)
                <span style={{
                  transform: showPQ ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform .2s", display: "inline-block",
                }}>▼</span>
              </button>
              {showPQ && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {currentPQ.map((pq, i) => (
                    <InlinePageQuestion key={`${activeSec}-${page}-${i}`} q={pq} index={i} color={color} mobile={mobile} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page navigation */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
            }}>
              <button onClick={() => goPage(-1)} disabled={page === 0} style={{
                ...btnS,
                background: page === 0 ? "#F3F4F6" : bg,
                color: page === 0 ? C.light : color,
                cursor: page === 0 ? "not-allowed" : "pointer",
              }}>
                ← 이전
              </button>

              {/* Page dots */}
              <div style={{ display: "flex", gap: 4 }}>
                {explainPages.map((_, i) => (
                  <button key={i} onClick={() => { setPage(i); setShowPQ(false); }} style={{
                    width: i === page ? 20 : 8, height: 8, borderRadius: 4,
                    background: i === page ? color : C.border,
                    border: "none", cursor: "pointer", padding: 0,
                    transition: "all .2s",
                  }} />
                ))}
              </div>

              <button onClick={() => goPage(1)} disabled={page === totalPages - 1} style={{
                ...btnS,
                background: page === totalPages - 1 ? "#F3F4F6" : bg,
                color: page === totalPages - 1 ? C.light : color,
                cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
              }}>
                다음 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Concept Cards (collapsible if explain sections exist) ── */}
      {sections.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowConcepts(!showConcepts)} style={{
            ...cardS, width: "100%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: `2px solid ${color}`,
            padding: "12px 16px",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color }}>
              💡 핵심 개념 카드 ({subtopic.key_concepts.length}개)
            </span>
            <span style={{
              fontSize: 16, color,
              transform: showConcepts ? "rotate(180deg)" : "rotate(0)",
              transition: "transform .2s", display: "inline-block",
            }}>▼</span>
          </button>
          {showConcepts && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {renderConceptCards(subtopic, tc, color, bg, mobile)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {renderConceptCards(subtopic, tc, color, bg, mobile)}
        </div>
      )}

      {/* Quiz section */}
      {questions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setShowQuiz(!showQuiz)} style={{
            ...cardS, width: "100%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: `2px solid ${C.green}`,
            padding: "12px 16px",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.green }}>
              📝 연습 문제 ({questions.length}문제)
            </span>
            <span style={{
              fontSize: 16, color: C.green,
              transform: showQuiz ? "rotate(180deg)" : "rotate(0)",
              transition: "transform .2s", display: "inline-block",
            }}>
              ▼
            </span>
          </button>

          {showQuiz && (
            <SlideQuizPanel questions={questions} mobile={mobile} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── CONCEPT CARDS RENDERER ───
function renderConceptCards(subtopic, tc, color, bg, mobile) {
  return subtopic.key_concepts.map((concept, i) => {
    const data = tc?.concepts[i];
    return (
      <div key={i} style={{
        ...cardS,
        padding: mobile ? 16 : 24,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{
            background: bg, color: color,
            width: 28, height: 28, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, flexShrink: 0,
          }}>
            {i + 1}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: mobile ? 16 : 20, fontWeight: 700,
              color: C.text, lineHeight: 1.4,
            }}>
              {concept}
            </div>
            {data?.ko && (
              <div style={{
                fontSize: mobile ? 15 : 18, color: color,
                fontWeight: 600, marginTop: 4,
              }}>
                {data.ko}
              </div>
            )}
            {data?.teach && (
              <div style={{
                fontSize: mobile ? 14 : 16, color: C.sub,
                lineHeight: 1.7, marginTop: 10,
                whiteSpace: "pre-wrap",
              }}>
                {data.teach}
              </div>
            )}
            {data?.examTip && (
              <div style={{
                marginTop: 10, padding: "8px 12px",
                background: C.orangeLight, borderRadius: 8,
                borderLeft: `3px solid ${C.orange}`,
                fontSize: mobile ? 13 : 14, color: "#92400E",
              }}>
                💡 {data.examTip}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

// ─── INLINE PAGE QUESTION ───
function InlinePageQuestion({ q, index, color, mobile }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedMC, setSelectedMC] = useState(Array.isArray(q.answer) ? [] : null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExpl, setShowExpl] = useState(false);

  const isCorrect = () => {
    if (q.type === "mc") {
      if (Array.isArray(q.answer)) {
        return Array.isArray(selectedMC) &&
          q.answer.length === selectedMC.length &&
          q.answer.every(a => selectedMC.includes(a));
      }
      return selectedMC === q.answer;
    }
    const norm = userAnswer.trim().toUpperCase().replace(/\s+/g, "");
    const accepted = q.accept || [q.answer];
    return accepted.some(a => String(a).toUpperCase().replace(/\s+/g, "") === norm);
  };

  const checkAnswer = () => setSubmitted(true);

  return (
    <div style={{
      ...cardS, padding: mobile ? 12 : 16,
      border: `1.5px solid ${submitted ? (isCorrect() ? C.green : C.red) : C.border}`,
    }}>
      {/* Question text */}
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
        <span style={{ color, fontWeight: 800, marginRight: 6 }}>Q{index + 1}.</span>
        {q.q}
        {q.marks != null && (
          <span style={{ color: C.light, fontWeight: 500, marginLeft: 6 }}>
            [{q.marks} mark{q.marks > 1 ? "s" : ""}]
          </span>
        )}
      </div>

      {/* MC options or text input */}
      {q.type === "mc" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(q.options || []).map((opt, i) => {
            const multiSelect = Array.isArray(q.answer);
            const isSelected = multiSelect
              ? (selectedMC || []).includes(i)
              : selectedMC === i;
            const isAnswer = multiSelect ? q.answer.includes(i) : q.answer === i;
            return (
              <button key={i} onClick={() => {
                if (submitted) return;
                if (multiSelect) {
                  setSelectedMC(prev => {
                    const arr = prev || [];
                    return arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i];
                  });
                } else {
                  setSelectedMC(i);
                }
              }} style={{
                ...btnS, textAlign: "left", padding: "8px 12px",
                background: submitted
                  ? (isAnswer ? C.greenLight : (isSelected ? C.redLight : "#F9FAFB"))
                  : (isSelected ? `${color}15` : "#F9FAFB"),
                color: C.text,
                border: `1.5px solid ${submitted
                  ? (isAnswer ? C.green : (isSelected ? C.red : C.border))
                  : (isSelected ? color : C.border)}`,
                cursor: submitted ? "default" : "pointer",
              }}>
                <span style={{
                  fontWeight: 700, marginRight: 8,
                  color: submitted ? (isAnswer ? C.green : C.sub) : color,
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          disabled={submitted}
          placeholder="답을 입력하세요"
          onKeyDown={e => e.key === "Enter" && !submitted && checkAnswer()}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: `1.5px solid ${submitted ? (isCorrect() ? C.green : C.red) : C.border}`,
            fontSize: 14, fontFamily: F, outline: "none",
            background: submitted ? (isCorrect() ? C.greenLight : C.redLight) : "#fff",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* Actions row */}
      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {!submitted && (
          <>
            <button onClick={checkAnswer} style={{ ...btnS, background: color, color: "#fff" }}>
              확인
            </button>
            {q.hint && (
              <button onClick={() => setShowHint(!showHint)} style={{
                ...btnS, background: C.orangeLight, color: "#92400E",
              }}>
                💡 힌트
              </button>
            )}
          </>
        )}
        {submitted && (
          <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect() ? C.green : C.red }}>
            {isCorrect() ? "✅ 정답!" : `❌ 오답 — 정답: ${q.answer}`}
          </div>
        )}
      </div>

      {/* Hint */}
      {showHint && !submitted && (
        <div style={{
          marginTop: 6, padding: "6px 10px",
          background: C.orangeLight, borderRadius: 8,
          fontSize: 12, color: "#78350F", lineHeight: 1.6,
        }}>
          💡 {q.hint}
        </div>
      )}

      {/* Explanation */}
      {submitted && q.explanation && (
        <div style={{ marginTop: 6 }}>
          <button onClick={() => setShowExpl(!showExpl)} style={{
            ...btnS, background: C.blueLight, color: C.blue, fontSize: 12,
          }}>
            {showExpl ? "풀이 닫기" : "📝 풀이 보기"}
          </button>
          {showExpl && (
            <div style={{
              marginTop: 6, padding: "8px 12px", background: "#F9FAFB",
              borderRadius: 8, fontSize: 12, fontFamily: "monospace",
              whiteSpace: "pre-wrap", lineHeight: 1.7, color: C.text,
            }}>
              {q.explanationTitle && (
                <div style={{ fontWeight: 700, marginBottom: 4, color, fontFamily: F }}>
                  {q.explanationTitle}
                </div>
              )}
              {q.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SLIDE QUIZ PANEL ───
function SlideQuizPanel({ questions, mobile }) {
  const [revealed, setRevealed] = useState(new Set());

  const toggleReveal = (qId) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      {questions.map((q, i) => (
        <div key={q.id} style={{ ...cardS, padding: mobile ? 12 : 16 }}>
          <QuizQuestion
            question={q}
            index={i}
            userAnswer={revealed.has(q.id) ? (q.type === "mc" ? q.answer : q.answer) : undefined}
            onAnswer={() => {}}
            submitted={revealed.has(q.id)}
          />
          {!revealed.has(q.id) && (
            <button onClick={() => toggleReveal(q.id)} style={{
              ...btnS, marginTop: 8,
              background: C.greenLight, color: "#065F46",
            }}>
              정답 보기
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SLIDE NAV ───
function SlideNav({ topic, subIdx, onPrev, onNext, onJump, onBack, mobile }) {
  const isFirst = subIdx === 0 && topic.id === 1;
  const isLast = subIdx === topic.subtopics.length - 1 &&
    topic.id === syllabusData.topics[syllabusData.topics.length - 1].id;

  return (
    <div style={{
      position: "sticky", bottom: mobile ? 60 : 0,
      background: C.white,
      borderTop: `1px solid ${C.border}`,
      padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderRadius: "0 0 12px 12px",
      marginTop: 16,
      zIndex: 10,
    }}>
      <button onClick={onPrev} disabled={isFirst} style={{
        ...btnS,
        background: isFirst ? "#F3F4F6" : C.purpleLight,
        color: isFirst ? C.light : C.purple,
        cursor: isFirst ? "not-allowed" : "pointer",
      }}>
        ← 이전
      </button>

      <div style={{ display: "flex", gap: 6 }}>
        {topic.subtopics.map((st, i) => (
          <button key={st.id} onClick={() => onJump(i)} style={{
            padding: "4px 10px", borderRadius: 6,
            border: i === subIdx ? `2px solid ${PAPER_COLORS[topic.paper]}` : `1px solid ${C.border}`,
            background: i === subIdx ? PAPER_BG[topic.paper] : "transparent",
            color: i === subIdx ? PAPER_COLORS[topic.paper] : C.sub,
            fontWeight: 700, fontSize: 12,
            cursor: "pointer", fontFamily: F,
          }}>
            {st.id}
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={isLast} style={{
        ...btnS,
        background: isLast ? "#F3F4F6" : C.purpleLight,
        color: isLast ? C.light : C.purple,
        cursor: isLast ? "not-allowed" : "pointer",
      }}>
        다음 →
      </button>
    </div>
  );
}
