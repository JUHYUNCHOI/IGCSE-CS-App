#!/usr/bin/env node
/**
 * Parse IGCSE CS 0478 past paper PDFs and generate pastPaperData.js
 * Extracts questions from QP PDFs, maps to subtopics via keywords.
 */
import { execSync } from "child_process";
import { readdirSync, writeFileSync } from "fs";
import { join, basename } from "path";

const BASE = "/Users/juhyunchoi/Desktop/IGCSE";

// ── Subtopic keyword mapping ──
const TOPIC_KEYWORDS = {
  "1.1": {
    name: "Number systems",
    keywords: [
      "binary", "denary", "hexadecimal", "number system", "convert",
      "addition", "overflow", "two's complement", "twos complement",
      "logical shift", "binary shift", "nibble",
    ],
  },
  "1.2": {
    name: "Text, sound and images",
    keywords: [
      "ascii", "unicode", "character set", "character encoding",
      "sample rate", "sample resolution", "bit depth", "sound",
      "pixel", "colour depth", "color depth", "image resolution",
      "bitmap", "image file", "image size",
    ],
  },
  "1.3": {
    name: "Data storage and compression",
    keywords: [
      "lossy", "lossless", "compression", "run length", "rle",
      "file size", "kibibyte", "mebibyte", "gibibyte", "tebibyte",
      "byte", "data storage", "units of data",
    ],
  },
  "2.1": {
    name: "Types and methods of data transmission",
    keywords: [
      "serial", "parallel", "simplex", "duplex", "half-duplex",
      "full-duplex", "data transmission", "usb", "bandwidth",
      "bit rate", "latency", "data packet", "packet switching",
    ],
  },
  "2.2": {
    name: "Error detection",
    keywords: [
      "parity", "check digit", "checksum", "echo check", "arq",
      "error detection", "error correction",
    ],
  },
  "2.3": {
    name: "Encryption",
    keywords: [
      "encrypt", "decrypt", "cipher", "plaintext", "ciphertext",
      "symmetric", "asymmetric", "public key", "private key",
    ],
  },
  "3.1": {
    name: "Computer architecture",
    keywords: [
      "cpu", "alu", "control unit", "register", "accumulator",
      "program counter", "fetch", "decode", "execute", "fde",
      "cache", "ram", "rom", "primary storage", "secondary storage",
      "von neumann", "clock speed", "bus", "address bus", "data bus",
      "core", "embedded system",
    ],
  },
  "3.2": {
    name: "Input and output devices",
    keywords: [
      "input device", "output device", "sensor", "actuator",
      "printer", "scanner", "keyboard", "mouse", "microphone",
      "speaker", "touchscreen", "barcode", "qr code",
      "inkjet", "laser printer", "3d printer",
    ],
  },
  "3.3": {
    name: "Data storage",
    keywords: [
      "hard disk", "hdd", "ssd", "solid state", "optical",
      "magnetic", "flash memory", "cloud storage", "storage device",
      "blu-ray", "dvd", "cd",
    ],
  },
  "3.4": {
    name: "Network hardware",
    keywords: [
      "router", "switch", "hub", "nic", "network interface",
      "wap", "wireless access point", "modem", "network hardware",
      "lan", "wan", "star", "bus topology", "mesh",
      "client-server", "peer-to-peer", "mac address",
    ],
  },
  "4.1": {
    name: "Operating systems",
    keywords: [
      "operating system", "scheduling", "memory management",
      "multitasking", "interrupt", "driver", "file management",
      "user interface", "gui", "cli", "virtual memory",
    ],
  },
  "4.2": {
    name: "Types of programming language and translators",
    keywords: [
      "compiler", "interpreter", "assembler", "ide",
      "high-level", "low-level", "machine code", "assembly language",
      "translator", "debugging", "syntax error", "logic error",
      "runtime error", "source code", "object code",
    ],
  },
  "5.1": {
    name: "The internet",
    keywords: [
      "url", "ip address", "dns", "web browser", "web server",
      "http", "https", "html", "cookie", "internet",
      "isp", "world wide web", "web page",
    ],
  },
  "5.2": {
    name: "Internet security",
    keywords: [
      "firewall", "proxy", "ssl", "tls", "phishing", "pharming",
      "malware", "virus", "worm", "trojan", "spyware", "ransomware",
      "hacking", "brute force", "ddos", "dos attack",
      "social engineering", "shoulder surfing",
    ],
  },
  "5.3": {
    name: "Cyber security",
    keywords: [
      "authentication", "biometric", "password", "two-factor",
      "access control", "permission", "username",
      "verification", "digital certificate",
    ],
  },
  "6.1": {
    name: "Automated systems",
    keywords: [
      "automated", "automation", "adc", "dac",
      "analogue", "digital signal", "feedback",
      "monitoring", "control system",
    ],
  },
  "6.2": {
    name: "Robotics",
    keywords: [
      "robot", "robotic", "surgery", "manufacturing",
      "domestic robot", "autonomous",
    ],
  },
  "6.3": {
    name: "Artificial intelligence",
    keywords: [
      "artificial intelligence", "expert system", "knowledge base",
      "rule base", "inference engine", "machine learning",
    ],
  },
  "7.1": {
    name: "Program development lifecycle",
    keywords: [
      "algorithm", "flowchart", "pseudocode", "trace table",
      "dry run", "program development", "decomposition",
      "abstraction", "structure diagram",
    ],
  },
  "7.2": {
    name: "Standard algorithms",
    keywords: [
      "linear search", "binary search", "bubble sort",
      "insertion sort", "merge sort", "sorting algorithm",
      "searching algorithm",
    ],
  },
  "8.1": {
    name: "Programming concepts",
    keywords: [
      "variable", "constant", "loop", "while", "for ", "repeat",
      "if ", "case of", "procedure", "function", "parameter",
      "selection", "iteration", "sequence", "data type",
      "integer", "real", "boolean", "string", "char",
      "subroutine", "local variable", "global variable",
    ],
  },
  "8.2": {
    name: "Arrays",
    keywords: [
      "array", "1d array", "2d array", "one-dimensional",
      "two-dimensional", "index",
    ],
  },
  "9.1": {
    name: "Databases",
    keywords: [
      "database", "table", "field", "record", "query", "sql",
      "select", "primary key", "foreign key", "validation",
      "flat file", "relational", "entity", "relationship",
    ],
  },
  "10.1": {
    name: "Boolean logic",
    keywords: [
      "boolean", "and gate", "or gate", "not gate", "nand", "nor",
      "xor", "truth table", "logic gate", "logic expression",
      "logic circuit", "logic diagram",
    ],
  },
};

// ── Parse paper code from filename ──
function parsePaperCode(filename) {
  // 0478_s25_qp_12.pdf → { year: 2025, session: "s", paper: 1, variant: 2 }
  const m = filename.match(/0478_([smw])(\d{2})_(?:qp|ms)_(\d)(\d)/);
  if (!m) return null;
  const sessionMap = { s: "May/Jun", w: "Oct/Nov", m: "Mar" };
  return {
    year: 2000 + parseInt(m[2]),
    session: m[1],
    sessionLabel: sessionMap[m[1]],
    paper: parseInt(m[3]),
    variant: parseInt(m[4]),
    code: `0478/${m[3]}${m[4]}/${m[1].toUpperCase()}/${sessionMap[m[1]].includes("Jun") ? "J" : sessionMap[m[1]].includes("Nov") ? "N" : "M"}/${m[2]}`,
  };
}

// ── Extract text from PDF ──
function extractText(pdfPath) {
  try {
    return execSync(`pdftotext "${pdfPath}" - 2>/dev/null`, {
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
  } catch {
    return "";
  }
}

// ── Parse questions from QP text ──
function parseQuestions(rawText, info) {
  const questions = [];

  // Step 1: Find main question positions using RAW text (before cleaning)
  const lines = rawText.split("\n");
  const mainQs = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].replace(/[\x00-\x1F]/g, "").trim();

    // Match a line that is just a question number (1-20)
    if (/^\d{1,2}$/.test(line)) {
      const num = parseInt(line);
      if (num >= 1 && num <= 20) {
        // Look ahead for question content
        let hasContent = false;
        for (let k = li + 1; k < Math.min(li + 8, lines.length); k++) {
          const nl = lines[k].replace(/[\x00-\x1F]/g, "").replace(/^[,\s]+/, "").trim();
          if (nl.length > 10 && nl.match(/[A-Z(]/)) {
            hasContent = true;
            break;
          }
        }
        if (hasContent) {
          mainQs.push({ num, lineIdx: li });
        }
      }
    }
  }

  // Step 2: Extract text blocks for each main question
  for (let i = 0; i < mainQs.length; i++) {
    const startLine = mainQs[i].lineIdx;
    const endLine = i + 1 < mainQs.length ? mainQs[i + 1].lineIdx : lines.length;

    // Join and clean the text block
    let text = lines.slice(startLine, endLine).join("\n");
    text = text
      .replace(/DO NOT WRITE IN THIS MARGIN/g, "")
      .replace(/\* \d+ \*/g, "")
      .replace(/[\x00-\x1F]/g, " ")
      .replace(/[^\x20-\x7E\n]/g, " ")
      .replace(/\.{5,}/g, "...")
      .replace(/\n\s*\n/g, "\n")
      .replace(/[ \t]+/g, " ");

    const qNum = mainQs[i].num;
    const qText = text;

    // Split into sub-parts (a), (b), (c), ...
    const subRegex = /\(([a-z])\)\s*/g;
    const subs = [];
    let sm;
    while ((sm = subRegex.exec(qText)) !== null) {
      subs.push({ part: sm[1], pos: sm.index });
    }

    if (subs.length === 0) {
      const marks = extractMarks(qText);
      if (marks > 0) {
        questions.push({
          qNum: `${qNum}`,
          text: cleanQText(qText),
          marks,
          subtopics: detectSubtopics(qText),
        });
      }
    } else {
      for (let j = 0; j < subs.length; j++) {
        const sStart = subs[j].pos;
        const sEnd = j + 1 < subs.length ? subs[j + 1].pos : qText.length;
        let subText = qText.slice(sStart, sEnd);

        // Check for sub-sub-parts (i), (ii), (iii)
        const subSubRegex = /\((i{1,3}v?)\)\s*/g;
        const subSubs = [];
        let ssm;
        while ((ssm = subSubRegex.exec(subText)) !== null) {
          subSubs.push({ part: ssm[1], pos: ssm.index });
        }

        if (subSubs.length > 0) {
          for (let k = 0; k < subSubs.length; k++) {
            const ssStart = subSubs[k].pos;
            const ssEnd = k + 1 < subSubs.length ? subSubs[k + 1].pos : subText.length;
            const ssText = subText.slice(ssStart, ssEnd);
            const marks = extractMarks(ssText);
            if (marks > 0) {
              const contextText = qText.slice(0, subs[0].pos) + " " + subText.slice(0, subSubs[0].pos) + " " + ssText;
              questions.push({
                qNum: `${qNum}(${subs[j].part})(${subSubs[k].part})`,
                text: cleanQText(ssText),
                context: cleanQText(qText.slice(0, subs[0].pos)),
                marks,
                subtopics: detectSubtopics(contextText),
              });
            }
          }
        } else {
          const marks = extractMarks(subText);
          if (marks > 0) {
            const contextText = qText.slice(0, subs[0].pos) + " " + subText;
            questions.push({
              qNum: `${qNum}(${subs[j].part})`,
              text: cleanQText(subText),
              context: cleanQText(qText.slice(0, subs[0].pos)),
              marks,
              subtopics: detectSubtopics(contextText),
            });
          }
        }
      }
    }
  }

  return questions;
}

function extractMarks(text) {
  const marks = text.match(/\[(\d+)\]/g);
  if (!marks) return 0;
  // Return total marks for this section
  return marks.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
}

function cleanQText(text) {
  return text
    .replace(/\[(\d+)\]/g, "")
    .replace(/\(([a-z])\)/g, "")
    .replace(/\((i{1,3}v?)\)/g, "")
    .replace(/Working space/g, "")
    .replace(/\.\.\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function detectSubtopics(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [id, { keywords }] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > 0) scores[id] = score;
  }

  // Return top matches (score > 0), sorted by score
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return sorted.slice(0, 2); // max 2 subtopics per question
}

// ── Main ──
function main() {
  const folders = readdirSync(BASE, { withFileTypes: true })
    .filter(f => f.isDirectory() && f.name.match(/^\d{4}/))
    .map(f => f.name);
  const allPapers = [];

  for (const folder of folders.sort()) {
    const folderPath = join(BASE, folder);
    const files = readdirSync(folderPath).filter(f => f.includes("_qp_"));

    for (const file of files.sort()) {
      const info = parsePaperCode(file);
      if (!info) continue;

      const qpPath = join(folderPath, file);
      const msFile = file.replace("_qp_", "_ms_");
      const msPath = join(folderPath, msFile);

      console.error(`Parsing ${file}...`);
      const text = extractText(qpPath);
      if (!text) continue;

      const questions = parseQuestions(text, info);

      allPapers.push({
        year: info.year,
        session: info.session,
        sessionLabel: info.sessionLabel,
        paper: info.paper,
        variant: info.variant,
        label: `${info.year} ${info.sessionLabel} P${info.paper}v${info.variant}`,
        qpFile: file,
        msFile: msFile,
        qpPath: `papers/${folder}/${file}`,
        msPath: `papers/${folder}/${msFile}`,
        totalMarks: questions.reduce((s, q) => s + q.marks, 0),
        questions: questions.map(q => ({
          qNum: q.qNum,
          text: q.text,
          context: q.context || "",
          marks: q.marks,
          subtopics: q.subtopics,
        })),
      });
    }
  }

  // Generate output
  const output = `// Auto-generated from IGCSE CS 0478 past papers
// ${allPapers.length} papers, ${allPapers.reduce((s, p) => s + p.questions.length, 0)} questions

export const pastPapers = ${JSON.stringify(allPapers, null, 2)};

// Helper: get all questions for a subtopic
export function getPastQuestionsBySubtopic(subtopicId) {
  const results = [];
  for (const paper of pastPapers) {
    for (const q of paper.questions) {
      if (q.subtopics.includes(subtopicId)) {
        results.push({
          ...q,
          paper: paper.label,
          year: paper.year,
          session: paper.session,
          paperNum: paper.paper,
          variant: paper.variant,
          qpFile: paper.qpFile,
          msFile: paper.msFile,
        });
      }
    }
  }
  return results.sort((a, b) => b.year - a.year);
}

// Helper: get question count per subtopic
export function getPastQuestionCountBySubtopic() {
  const counts = {};
  for (const paper of pastPapers) {
    for (const q of paper.questions) {
      for (const st of q.subtopics) {
        counts[st] = (counts[st] || 0) + 1;
      }
    }
  }
  return counts;
}

// Helper: get papers list
export function getPapersList() {
  return pastPapers.map(p => ({
    label: p.label,
    year: p.year,
    session: p.session,
    sessionLabel: p.sessionLabel,
    paper: p.paper,
    variant: p.variant,
    qpFile: p.qpFile,
    msFile: p.msFile,
    totalMarks: p.totalMarks,
    questionCount: p.questions.length,
  }));
}
`;

  writeFileSync(join("/Users/juhyunchoi/Desktop/IGCSE-App/src/data", "pastPaperData.js"), output);
  console.error(`Done! ${allPapers.length} papers, ${allPapers.reduce((s, p) => s + p.questions.length, 0)} questions`);

  // Print stats
  const subtopicCounts = {};
  for (const paper of allPapers) {
    for (const q of paper.questions) {
      for (const st of q.subtopics) {
        subtopicCounts[st] = (subtopicCounts[st] || 0) + 1;
      }
    }
  }
  console.error("\nQuestions per subtopic:");
  for (const [st, count] of Object.entries(subtopicCounts).sort()) {
    console.error(`  ${st}: ${count}`);
  }
}

main();
