import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';

const md = readFileSync(process.argv[2], 'utf-8');
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>모바일인덱스 MCP 상품 기획서</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { padding: 24px 20px; } }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif; background:#f8f9fa; color:#1a1a2e; line-height:1.75; font-size:14px; }
  .page { max-width:860px; margin:0 auto; padding:48px 40px; background:#fff; min-height:100vh; }

  h1 { font-size:26px; font-weight:800; color:#1a1a2e; margin:40px 0 16px; }
  h1:first-child { margin-top:0; }
  h2 { font-size:20px; font-weight:700; color:#1a1a2e; margin:32px 0 12px; }
  h3 { font-size:16px; font-weight:700; color:#374151; margin:24px 0 8px; }
  p { margin-bottom:12px; color:#374151; }
  strong { color:#1a1a2e; }
  hr { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }

  ul, ol { padding-left:24px; margin-bottom:12px; color:#374151; }
  li { margin-bottom:4px; }

  table { width:100%; border-collapse:collapse; margin:12px 0 20px; font-size:13px; }
  thead th { background:#f3f4f6; color:#374151; font-weight:700; padding:8px 12px; text-align:left; border-bottom:2px solid #d1d5db; }
  tbody td { padding:8px 12px; border-bottom:1px solid #e5e7eb; color:#4b5563; }
  tbody tr:hover { background:#f9fafb; }

  blockquote { background:#fff7ed; border-left:4px solid #e85d04; border-radius:0 8px 8px 0; padding:14px 18px; margin:12px 0 16px; }
  blockquote p { color:#92400e; margin-bottom:4px; font-size:13px; }
  blockquote p:last-child { margin-bottom:0; }

  pre { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin:12px 0 16px; overflow-x:auto; font-size:13px; line-height:1.6; }
  code { font-family:'SF Mono','Fira Code',monospace; font-size:13px; }
  p code, li code, td code { background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:12px; }

  a { color:#e85d04; text-decoration:none; }
  a:hover { text-decoration:underline; }

  input[type="checkbox"] { margin-right:6px; }
</style>
</head>
<body>
<div class="page">
${body}
</div>
</body>
</html>`;

writeFileSync(process.argv[3], html);
console.log('Done:', process.argv[3]);
