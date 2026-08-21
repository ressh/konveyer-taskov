#!/usr/bin/env node
// =============================================================
// konveyer — бесплатная часть конвейера тасков.
//
// Без аргументов: экран онбординга — что уже есть в системе, какие промпты
// и в каком порядке скармливать Claude Code.
//   konveyer init        разложить промпты и Makefile в текущий проект
//   konveyer prompt 1    напечатать промпт (удобно: konveyer prompt 1 | pbcopy)
//
// Зависимостей нет намеренно: npx должен отрабатывать мгновенно, а не тянуть
// половину реестра ради четырёх markdown-файлов.
// =============================================================

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const pkg = require(path.join(ROOT, 'package.json'));

// ── оформление ───────────────────────────────────────────────
// Цвет гасим, когда вывод уходит не в терминал (в пайп, в файл, в CI):
// иначе ESC-последовательности попадут в текст, который человек копирует.
const plain = !process.stdout.isTTY || process.env.NO_COLOR;
const c = (code, s) => (plain ? s : `\x1b[${code}m${s}\x1b[0m`);
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const accent = (s) => c('36', s);
const ok = (s) => c('32', s);
const warn = (s) => c('33', s);

const PROMPTS = [
  { n: 1, file: 'prompt-1-razvedka.md', title: 'научите ИИ вашей Jira', note: 'создаёт .env, проверяет связь, разведывает доску' },
  { n: 2, file: 'prompt-2-reglament.md', title: 'закрепите навык в CLAUDE.md', note: 'регламент действует в каждой новой сессии' },
  { n: 3, file: 'prompt-3-rabota.md', title: 'рабочий режим', note: '«возьми в работу KAN-12» — и всё' },
  { n: 4, file: 'prompt-4-reviewer.md', title: 'AI-ревьюер', note: 'второй агент проверяет задачу перед Done' },
];

// ── проверки окружения ───────────────────────────────────────

/** Есть ли команда в PATH. Тихо: отсутствие — обычное дело, не ошибка. */
function has(cmd) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checks() {
  const node = process.versions.node;
  const nodeOk = Number(node.split('.')[0]) >= 18;
  return [
    { label: `Node ${node}`, ok: nodeOk, fix: 'нужен Node 18+: nodejs.org или nvm' },
    { label: 'git', ok: has('git'), fix: 'поставьте git: git-scm.com' },
    { label: 'Claude Code', ok: has('claude'), fix: 'npm install -g @anthropic-ai/claude-code' },
    { label: '.env с доступом к Jira', ok: fs.existsSync(path.join(process.cwd(), '.env')), fix: 'создаст промпт №1 — это нормально на старте' },
  ];
}

// ── экраны ───────────────────────────────────────────────────

function promo() {
  console.log(dim('─'.repeat(62)));
  console.log(`${bold('Дальше — «Конвейер тасков»')}: эпики и волны задач, отдельный`);
  console.log('git worktree на каждую задачу, два AI-ревьюера (код и архитектура),');
  console.log('приёмка волн и деплой. Несколько агентов работают параллельно и');
  console.log('не мешают друг другу.');
  console.log(`   Как это работает: ${accent('https://html5-studio.ru/uslugi/konveyer')}`);
  console.log(`   Вопросы автору: ${accent('https://t.me/paul_cop')}`);
}

function welcome() {
  console.log('');
  console.log(bold('  🛠  Конвейер тасков — бесплатная часть'));
  console.log(dim('  ИИ берёт тикет из Jira, пишет код, проходит ревью и закрывает задачу.'));
  console.log('');

  console.log(bold('  Что у вас есть:'));
  for (const ch of checks()) {
    console.log(ch.ok ? `   ${ok('✓')} ${ch.label}` : `   ${warn('•')} ${ch.label} ${dim('— ' + ch.fix)}`);
  }
  console.log('');

  console.log(bold('  Промпты — скармливайте по порядку:'));
  for (const p of PROMPTS) {
    console.log(`   ${accent(String(p.n))}. ${p.title} ${dim('— ' + p.note)}`);
  }
  console.log('');

  console.log(bold('  Как пользоваться:'));
  console.log(`   ${accent('npx konveyer init')}       разложить промпты и Makefile в этот проект`);
  console.log(`   ${accent('npx konveyer prompt 1')}   напечатать промпт ${dim('(| pbcopy — сразу в буфер)')}`);
  console.log('');
  console.log(dim('  Инструкция с картинками: https://html5-studio.ru/kurs'));
  console.log('');
  promo();
  console.log('');
}

/**
 * Регламент работы с Jira в CLAUDE.md — память Claude Code между сессиями.
 * Раньше его записывал промпт №2; теперь кладём сразу, чтобы после одной
 * команды у человека были и правила, и промпты.
 *
 * Чужой CLAUDE.md не перезаписываем никогда: в проекте человека это его
 * файл с его правилами — дописываем раздел в конец и только если его нет.
 */
const CLAUDE_SECTION = '## Работа с Jira';

function ensureClaudeMd() {
  const target = path.join(process.cwd(), 'CLAUDE.md');
  const section = fs.readFileSync(path.join(ROOT, 'templates', 'CLAUDE-jira.md'), 'utf8');

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, `# Правила проекта\n\n${section}`);
    console.log(`   ${ok('✓')} CLAUDE.md — регламент работы с Jira`);
    return true;
  }
  const current = fs.readFileSync(target, 'utf8');
  if (current.includes(CLAUDE_SECTION)) {
    console.log(`   ${dim('•')} CLAUDE.md ${dim('— раздел «Работа с Jira» уже есть, не трогаю')}`);
    return false;
  }
  fs.appendFileSync(target, `${current.endsWith('\n') ? '' : '\n'}\n${section}`);
  console.log(`   ${ok('✓')} CLAUDE.md — дописал раздел «Работа с Jira»`);
  return true;
}

/** Копирование без перезаписи: чужой файл в проекте человека — не наша вещь. */
function copyIfAbsent(from, to, label) {
  if (fs.existsSync(to)) {
    console.log(`   ${dim('•')} ${label} ${dim('— уже есть, не трогаю')}`);
    return false;
  }
  fs.cpSync(from, to, { recursive: true });
  console.log(`   ${ok('✓')} ${label}`);
  return true;
}

function init() {
  const cwd = process.cwd();
  console.log('');
  console.log(bold(`  Раскладываю конвейер в ${cwd}`));
  console.log('');

  ensureClaudeMd();
  copyIfAbsent(path.join(ROOT, 'prompts'), path.join(cwd, 'prompts'), 'prompts/ — четыре промпта');
  copyIfAbsent(path.join(ROOT, 'Makefile'), path.join(cwd, 'Makefile'), 'Makefile — make task / pr / done');

  const envExample = path.join(cwd, '.env.example');
  if (!fs.existsSync(envExample)) {
    fs.writeFileSync(envExample, [
      'JIRA_BASE_URL=https://your-company.atlassian.net',
      'JIRA_EMAIL=you@example.com',
      'JIRA_API_TOKEN=',
      'JIRA_PROJECT=KAN',
      '',
    ].join('\n'));
    console.log(`   ${ok('✓')} .env.example — четыре поля для Jira`);
  } else {
    console.log(`   ${dim('•')} .env.example ${dim('— уже есть, не трогаю')}`);
  }

  console.log('');
  console.log(bold('  Дальше:'));
  console.log(`   1. Токен Jira: ${accent('https://id.atlassian.com')} → Security → Create API token`);
  console.log(`   2. ${accent('npx konveyer prompt 1')} → вставьте в Claude Code, впишите доступы`);
  console.log(`   3. ${bold('«возьми в работу KAN-1»')} — регламент уже в CLAUDE.md`);
  console.log(dim('      Промпт №2 можно пропустить: регламент положила эта команда.'));
  console.log(dim('      Промпт №4 — когда захотите отдельного AI-ревьюера.'));
  console.log('');
  console.log(warn('   Не забудьте: .env — в .gitignore. В нём токен доступа к вашей Jira.'));
  console.log('');
}

function printPrompt(arg) {
  const found = PROMPTS.find((p) => String(p.n) === String(arg));
  if (!found) {
    console.error(`Промпт «${arg}» не найден. Есть: 1, 2, 3, 4.`);
    process.exit(1);
  }
  // Печатаем как есть, без рамок и цвета: этот вывод человек копирует в чат.
  process.stdout.write(fs.readFileSync(path.join(ROOT, 'prompts', found.file), 'utf8'));
}

function help() {
  console.log(`
  konveyer — бесплатная часть конвейера тасков

  ${accent('npx konveyer')}             экран онбординга: что есть, что дальше
  ${accent('npx konveyer init')}        разложить промпты и Makefile в текущий проект
  ${accent('npx konveyer prompt N')}    напечатать промпт N (1–4)
  ${accent('npx konveyer --version')}   версия пакета

  Документация: https://html5-studio.ru/kurs
`);
}

// ── разбор аргументов ────────────────────────────────────────

const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
  case undefined:
    welcome();
    break;
  case 'init':
    init();
    break;
  case 'prompt':
    printPrompt(arg);
    break;
  case 'help':
  case '--help':
  case '-h':
    help();
    break;
  case 'version':
  case '--version':
  case '-v':
    console.log(pkg.version);
    break;
  default:
    console.error(`Неизвестная команда «${cmd}». Подсказка: npx konveyer help`);
    process.exit(1);
}
