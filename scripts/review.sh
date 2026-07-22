#!/bin/bash
# review.sh — AI-ревью диффа через Anthropic API.
# Для CI или запуска вне Claude Code: скрипт берёт diff текущей ветки
# против main и отправляет его модели с системным промптом ревьюера.
#
# Нужны: curl, jq и ключ API:  export ANTHROPIC_API_KEY=sk-ant-...
# Использование:  ./scripts/review.sh [базовая_ветка]

set -euo pipefail

BASE_BRANCH="${1:-main}"
DIFF=$(git diff "$BASE_BRANCH"...HEAD)

if [ -z "$DIFF" ]; then
    echo "Нет изменений относительно $BASE_BRANCH — ревьюить нечего."
    exit 0
fi

SYSTEM='Ты строгий код-ревьюер. Проверь diff по чек-листу: 1) ошибки и крайние случаи (пустые данные, null, конкурентный доступ); 2) безопасность — секреты в коде, SQL-инъекции, незащищённые эндпоинты; 3) читаемость и стиль. Каждое замечание — с приоритетом: P0 (блокер), P1 (исправить сейчас), P2 (можно отложить), P3 (вкусовщина) — и с указанием файла и строки. Если замечаний нет — напиши APPROVED.'

curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "$(jq -n --arg diff "$DIFF" --arg system "$SYSTEM" '{
        model: "claude-sonnet-5",
        max_tokens: 3000,
        system: $system,
        messages: [{role: "user", content: ("Сделай ревью диффа:\n\n" + $diff)}]
    }')" | jq -r '.content[0].text'
