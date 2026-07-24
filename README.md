# Конвейер тасков — бесплатная часть

ИИ сам берёт задачи из Jira: читает описание, пишет код, проходит AI-ревью и закрывает тикет с комментарием. Это открытая часть курса — промпты, которые настраиваются за один вечер. Отдельный API-ключ не нужен: всё работает на вашей подписке Claude Code.

**Полный курс с пошаговой инструкцией:** [html5-studio.ru/kurs](https://html5-studio.ru/kurs)

## Что внутри

| Файл | Что делает |
|---|---|
| [prompts/prompt-1-razvedka.md](prompts/prompt-1-razvedka.md) | Учит ИИ вашей Jira-доске: статусы, переходы, задачи. Только чтение, ничего не меняет |
| [prompts/prompt-2-reglament.md](prompts/prompt-2-reglament.md) | Записывает регламент работы с Jira в CLAUDE.md — навык остаётся в каждой новой сессии |
| [prompts/prompt-3-rabota.md](prompts/prompt-3-rabota.md) | Рабочий режим: «возьми в работу KAN-12» — и всё |
| [prompts/prompt-4-reviewer.md](prompts/prompt-4-reviewer.md) | AI-ревьюер: отдельный агент проверяет каждую задачу перед Done по чек-листу с приоритетами P0–P3 |

## Быстрый старт

1. Jira Cloud (бесплатный план) + API-токен: id.atlassian.com → Security → Create API token
2. `.env` в корне проекта: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT` (и `.env` — в `.gitignore`!)
3. `npm install -g @anthropic-ai/claude-code`, в папке проекта — `claude`, модель Fable
4. Промпты 1 → 2 → 3 по очереди. Промпт 4 — когда захотите ревью

Подробная инструкция с картинками — [в бесплатном курсе](https://html5-studio.ru/kurs).

> **Нет своего проекта под рукой?** Возьмите готовый шаблон
> [ressh/konveyer-starter](https://github.com/ressh/konveyer-starter) (кнопка
> **«Use this template»**) — простое приложение и вся обвязка уже внутри
> (`Makefile`, `CLAUDE.md`, ревьюер). Останется вписать `.env` и запустить `make task`.

## Уровни выше

Этот репозиторий — уровень 1: одна задача за раз. Полный конвейер, на котором мы разрабатываем [CHATBOSS.PRO](https://chatboss.pro), — это эпики и волны, git worktree на каждую задачу, два AI-ревьюера (код + архитектура) и staged deploy:

- **Мануал «AI-конвейер своими руками»** — [предзаказ 2 990 ₽](https://html5-studio.ru/manual)
- **Настройка под ключ** — [форматы и цены](https://html5-studio.ru/uslugi/ai-konveyer-zadach)

## Обновления

Репозиторий пополняется по мере выхода глав мануала. Нажмите **Watch** (или ⭐), чтобы получить весточку.

Вопросы: Telegram [@paul_cop](https://t.me/paul_cop) · [html5-studio.ru](https://html5-studio.ru)
