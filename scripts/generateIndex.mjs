import fs from 'fs';
import path from 'path';

const sessionsDir = '/Users/juhyunchoi/Desktop/IGCSE-App/public/papers';
const sessionCodeMap = { s: 'May/June', w: 'Oct/Nov', m: 'March' };
const typeMap = { qp: '시험지 (Question Paper)', ms: '채점기준 (Mark Scheme)', gt: '등급 커트라인 (Grade Thresholds)', er: '시험관 보고서 (Examiner Report)', pm: 'Pre-release Material' };

const papers = [];
const sessions = fs.readdirSync(sessionsDir).filter(d => fs.statSync(path.join(sessionsDir, d)).isDirectory());

for (const session of sessions) {
  const dir = path.join(sessionsDir, session);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
  for (const file of files) {
    const match = file.match(/^0478_([smw])(\d{2})_(qp|ms|gt|er|pm)_?(\d{2})?\.pdf$/);
    if (!match) continue;
    const [, sc, yr, type, variant] = match;
    const year = 2000 + parseInt(yr);
    const paper = variant ? parseInt(variant[0]) : null;
    const v = variant ? parseInt(variant[1]) : null;
    papers.push({
      filename: file,
      folder: session,
      path: `/papers/${session}/${file}`,
      year,
      sessionCode: sc,
      sessionName: sessionCodeMap[sc],
      type,
      typeName: typeMap[type],
      paper,
      variant: v,
      variantCode: variant || null,
    });
  }
}

// Sort by year desc, then session, then paper, then variant
papers.sort((a, b) => {
  if (b.year !== a.year) return b.year - a.year;
  const so = { w: 0, s: 1, m: 2 };
  if (so[a.sessionCode] !== so[b.sessionCode]) return so[a.sessionCode] - so[b.sessionCode];
  if (a.paper !== b.paper) return (a.paper || 0) - (b.paper || 0);
  return (a.variant || 0) - (b.variant || 0);
});

const output = `// Auto-generated paper index\nexport const paperIndex = ${JSON.stringify(papers, null, 2)};\n`;
fs.writeFileSync('/Users/juhyunchoi/Desktop/IGCSE-App/src/data/paperIndex.js', output);
console.log('Generated paperIndex.js with', papers.length, 'entries');
