# ===== Конвейер тасков — базовые команды =====
# make task T=KAN-12    взять задачу: ветка + worktree + Claude
# make pr               открыть Pull Request (для ревью Copilot)
# make done T=KAN-12    влить ветку и прибрать за собой

BASE ?= main

task:
	@test -n "$(T)" || { echo "Так: make task T=KAN-12"; exit 1; }
	git fetch origin $(BASE)
	git worktree add -b feature/$(T) ../wt-$(T) origin/$(BASE)
	@cp .env ../wt-$(T)/.env 2>/dev/null || true
	@echo "→ feature/$(T) готова в ../wt-$(T)"
	cd ../wt-$(T) && claude "Возьми в работу задачу $(T). Работай по регламенту из CLAUDE.md: статусы в Jira, код, AI-ревью до Done."

pr:
	git push -u origin HEAD
	gh pr create --fill

done:
	@test -n "$(T)" || { echo "Так: make done T=KAN-12"; exit 1; }
	git checkout $(BASE) && git pull origin $(BASE)
	git merge --no-ff feature/$(T) -m "merge: $(T)"
	git push origin $(BASE)
	git worktree remove ../wt-$(T) --force
	git branch -d feature/$(T)
