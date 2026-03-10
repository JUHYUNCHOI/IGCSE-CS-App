#!/usr/bin/env node
/**
 * Parse IGCSE CS 0478 mark scheme PDFs → extract answers per question
 * Then merge into pastPaperData.js
 */
import { execSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = "/Users/juhyunchoi/Desktop/IGCSE";

function extractText(pdfPath) {
  try {
    return execSync(`pdftotext "${pdfPath}" - 2>/dev/null`, {
      encoding: "utf-8",
      maxBuffer: 2 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

function parsePaperCode(filename) {
  const m = filename.match(/0478_([smw])(\d{2})_ms_(\d)(\d)/);
  if (!m) return null;
  const sessionMap = { s: "May/Jun", w: "Oct/Nov", m: "Mar" };
  return {
    year: 2000 + parseInt(m[2]),
    session: m[1],
    sessionLabel: sessionMap[m[1]],
    paper: parseInt(m[3]),
    variant: parseInt(m[4]),
    qpFile: filename.replace("_ms_", "_qp_"),
  };
}

/**
 * Parse mark scheme text into { "1(a)": { answer, type }, ... }
 */
function parseMarkScheme(rawText) {
  const lines = rawText.split("\n");
  const answers = {};

  // Find all question number positions
  const qPositions = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/[\x00-\x1F]/g, "").trim();
    // Match patterns like: 1(a), 2(b)(i), 3, 5(c)(ii)
    const m = line.match(/^(\d{1,2}(?:\([a-z]\))?(?:\(i{1,3}v?\))?)$/);
    if (m) {
      // Verify it's in the answer section (after generic marking principles)
      qPositions.push({ qNum: m[1], lineIdx: i });
    }
  }

  // Also match standalone numbers (for Paper 2 style: "1" then "Answer" on next lines)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/[\x00-\x1F]/g, "").trim();
    if (/^\d{1,2}$/.test(line)) {
      const num = parseInt(line);
      if (num >= 1 && num <= 20) {
        // Check if next few lines have "Answer" or marking content
        let isAnswer = false;
        for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
          const nl = lines[k].replace(/[\x00-\x1F]/g, "").trim();
          if (nl === "Answer" || nl.match(/^[A-D]$/) || nl.match(/^Any (one|two|three|four|five) from/i)) {
            isAnswer = true;
            break;
          }
        }
        if (isAnswer) {
          // Check if already exists
          const exists = qPositions.some(q => q.qNum === String(num));
          if (!exists) {
            qPositions.push({ qNum: String(num), lineIdx: i });
          }
        }
      }
    }
  }

  // Sort by line position
  qPositions.sort((a, b) => a.lineIdx - b.lineIdx);

  // Extract answer text between question positions
  for (let i = 0; i < qPositions.length; i++) {
    const start = qPositions[i].lineIdx;
    const end = i + 1 < qPositions.length ? qPositions[i + 1].lineIdx : Math.min(start + 50, lines.length);
    const qNum = qPositions[i].qNum;

    // Skip if it's a "Question" header line
    if (lines[start].trim() === "Question") continue;

    let block = lines.slice(start + 1, end)
      .map(l => l.replace(/[\x00-\x1F]/g, "").trim())
      .filter(l => l.length > 0)
      .filter(l => !l.match(/^Question$/))
      .filter(l => !l.match(/^Answer$/))
      .filter(l => !l.match(/^Marks?$/))
      .filter(l => !l.match(/^Page \d+ of \d+$/))
      .filter(l => !l.match(/^Cambridge/))
      .filter(l => !l.match(/^0478/))
      .filter(l => !l.match(/^February|^May|^October|^March/))
      .filter(l => !l.match(/^PUBLISHED$/))
      .filter(l => !l.match(/^© Cambridge/))
      .join("\n")
      .trim();

    if (!block) continue;

    // Determine answer type and clean answer
    const parsed = classifyAnswer(block, qNum);
    if (parsed) {
      answers[qNum] = parsed;
    }
  }

  return answers;
}

/**
 * Classify answer type and extract key info
 */
function classifyAnswer(block, qNum) {
  const clean = block.replace(/\s+/g, " ").trim();

  // Type 1: Single letter (MC) - e.g., "C" or "B"
  if (/^[A-D](\s+1)?$/.test(clean)) {
    return {
      type: "mc",
      answer: clean.charAt(0),
      marks: 1,
      fullText: clean,
    };
  }

  // Type 2: Single word/short answer (1 mark) - e.g., "Router", "True"
  const singleWordMatch = clean.match(/^([A-Za-z][\w\s\-\/()]{0,40}?)(\s+1)?$/);
  if (singleWordMatch && !clean.includes("Any") && !clean.includes("•") && clean.split(" ").length <= 5) {
    // Check it's not a description
    const answer = singleWordMatch[1].trim();
    if (answer.length <= 50 && !answer.match(/^(1 mark|max|For example)/i)) {
      return {
        type: "short",
        answer: answer,
        marks: 1,
        fullText: clean,
      };
    }
  }

  // Type 3: Numeric answer
  const numMatch = clean.match(/^(\d[\d\s]*\d?)(\s+1)?$/);
  if (numMatch) {
    return {
      type: "short",
      answer: numMatch[1].trim(),
      marks: 1,
      fullText: clean,
    };
  }

  // Extract marks from block
  let marks = 0;
  const marksMatch = block.match(/(\d+)\s*$/m);
  if (marksMatch) marks = parseInt(marksMatch[1]);
  // Also check for standalone number at end
  const lastLine = block.split("\n").pop().trim();
  if (/^\d{1,2}$/.test(lastLine)) marks = parseInt(lastLine);

  // Type 4: "1 mark for each" fill-in-blank style
  if (clean.match(/1 mark for each correct/i) || clean.match(/1 mark for each correct item/i)) {
    // Extract the bold/correct items if possible
    return {
      type: "markscheme",
      answer: "",
      marks,
      fullText: cleanMsText(block),
    };
  }

  // Type 5: "Any X from" - list type
  if (clean.match(/Any (one|two|three|four|five|six) from/i)) {
    const items = extractBulletItems(block);
    return {
      type: "markscheme",
      answer: "",
      marks,
      fullText: cleanMsText(block),
      acceptedAnswers: items,
    };
  }

  // Default: mark scheme text (for describe/explain questions)
  return {
    type: "markscheme",
    answer: "",
    marks,
    fullText: cleanMsText(block),
  };
}

function extractBulletItems(block) {
  const items = [];
  for (const line of block.split("\n")) {
    const clean = line.replace(/[\x00-\x1F]/g, "").trim();
    if (clean.startsWith("•") || clean.startsWith("-") || clean.startsWith("·")) {
      const item = clean.replace(/^[•\-·]\s*/, "").trim();
      if (item.length > 2 && item.length < 200) {
        items.push(item);
      }
    }
  }
  return items;
}

function cleanMsText(text) {
  return text
    .replace(/[\x00-\x1F]/g, " ")
    .replace(/[^\x20-\x7E\n•·\-]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim()
    .slice(0, 500);
}

// ── Main ──
function main() {
  const folders = readdirSync(BASE, { withFileTypes: true })
    .filter(f => f.isDirectory() && f.name.match(/^\d{4}/))
    .map(f => f.name);

  // Map: qpFile → { qNum → answer }
  const allAnswers = {};
  let totalMs = 0;
  let totalAnswers = 0;

  for (const folder of folders.sort()) {
    const folderPath = join(BASE, folder);
    const msFiles = readdirSync(folderPath).filter(f => f.includes("_ms_"));

    for (const msFile of msFiles.sort()) {
      const info = parsePaperCode(msFile);
      if (!info) continue;

      console.error(`Parsing MS: ${msFile}...`);
      const text = extractText(join(folderPath, msFile));
      if (!text) continue;

      const answers = parseMarkScheme(text);
      const ansCount = Object.keys(answers).length;
      if (ansCount > 0) {
        allAnswers[info.qpFile] = answers;
        totalAnswers += ansCount;
        totalMs++;
      }
    }
  }

  console.error(`\nParsed ${totalMs} mark schemes, ${totalAnswers} answers total`);

  // Now read existing pastPaperData.js and merge answers
  const dataPath = "/Users/juhyunchoi/Desktop/IGCSE-App/src/data/pastPaperData.js";
  const dataContent = readFileSync(dataPath, "utf-8");

  // Extract the pastPapers array
  const match = dataContent.match(/export const pastPapers = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error("ERROR: Could not find pastPapers array in data file");
    process.exit(1);
  }

  const pastPapers = JSON.parse(match[1]);
  let mergedCount = 0;

  for (const paper of pastPapers) {
    const msAnswers = allAnswers[paper.qpFile];
    if (!msAnswers) continue;

    for (const q of paper.questions) {
      const ans = msAnswers[q.qNum];
      if (ans) {
        q.answerType = ans.type;
        q.answer = ans.answer || "";
        q.markScheme = ans.fullText || "";
        if (ans.acceptedAnswers) q.acceptedAnswers = ans.acceptedAnswers;
        mergedCount++;
      } else {
        // Try without sub-part matching (just the number)
        q.answerType = "markscheme";
        q.answer = "";
        q.markScheme = "";
      }
    }
  }

  console.error(`Merged ${mergedCount} answers into questions`);

  // Stats
  const types = { mc: 0, short: 0, markscheme: 0, none: 0 };
  for (const paper of pastPapers) {
    for (const q of paper.questions) {
      types[q.answerType || "none"]++;
    }
  }
  console.error(`Answer types: MC=${types.mc}, Short=${types.short}, MarkScheme=${types.markscheme}, None=${types.none}`);

  // Write updated data
  const output = `// Auto-generated from IGCSE CS 0478 past papers + mark schemes
// ${pastPapers.length} papers, ${pastPapers.reduce((s, p) => s + p.questions.length, 0)} questions
// Answer types: ${types.mc} MC, ${types.short} short, ${types.markscheme} mark scheme

export const pastPapers = ${JSON.stringify(pastPapers, null, 2)};

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

  writeFileSync(dataPath, output);
  console.error("Written updated pastPaperData.js");
}

main();
