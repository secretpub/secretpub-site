#!/usr/bin/env bash
# Rappel de synchronisation au démarrage d'une session Claude Code (hook SessionStart).
#
# Le travail est partagé entre VS Code (en local) et des sessions Claude Code
# dans le cloud, qui poussent leurs modifications sur des branches GitHub à part.
# Ce script regarde GitHub et signale à Claude ce qui n'est pas encore récupéré
# en local, pour qu'il le dise à l'utilisateur avant de coder.
# Lecture seule : il ne modifie jamais rien et ne bloque jamais la session.

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

RECENT_DAYS=10   # branches GitHub actives sur cette période
MAX_LIST=6       # au-delà, on résume

# Fetch borné dans le temps : sans réseau, on continue avec l'état connu.
if command -v timeout >/dev/null 2>&1; then
  timeout 20 git fetch --quiet --prune origin '+refs/heads/*:refs/remotes/origin/*' >/dev/null 2>&1
else
  git fetch --quiet --prune origin '+refs/heads/*:refs/remotes/origin/*' >/dev/null 2>&1
fi

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
msgs=()

# 1. Branche courante : en retard ou en avance sur GitHub.
if git rev-parse --verify --quiet "origin/$branch" >/dev/null; then
  behind=$(git rev-list --count "HEAD..origin/$branch" 2>/dev/null || echo 0)
  ahead=$(git rev-list --count "origin/$branch..HEAD" 2>/dev/null || echo 0)
  [ "$behind" -gt 0 ] && msgs+=("La branche courante '$branch' a $behind commit(s) sur GitHub absents en local : proposer 'git pull' AVANT toute modification.")
  [ "$ahead" -gt 0 ] && msgs+=("La branche courante '$branch' a $ahead commit(s) locaux non poussés : proposer 'git push'.")
elif [ "$branch" != "HEAD" ]; then
  msgs+=("La branche courante '$branch' n'existe pas sur GitHub : proposer 'git push -u origin $branch'.")
fi

# 2. Branches GitHub récentes dont le travail n'est pas dans la branche courante
#    (typiquement une fonctionnalité faite dans une session cloud).
since=$(( $(date +%s) - RECENT_DAYS * 86400 ))
count=0; extra=0
while IFS='|' read -r ts ref; do
  name=${ref#origin/}
  case "$name" in HEAD|"$branch"|"") continue ;; esac
  [ "$ts" -ge "$since" ] 2>/dev/null || continue
  # --cherry-pick : un commit déjà repris (copié) dans la branche courante ne compte pas.
  n=$(git rev-list --count --cherry-pick --right-only "HEAD...$ref" 2>/dev/null || echo 0)
  [ "$n" -gt 0 ] || continue
  if [ "$count" -lt "$MAX_LIST" ]; then
    last=$(git log -1 --format='%cd · %s' --date=short "$ref" 2>/dev/null)
    msgs+=("Branche GitHub '$name' : $n commit(s) absents de '$branch' (dernier : $last).")
    count=$((count + 1))
  else
    extra=$((extra + 1))
  fi
done < <(git for-each-ref --sort=-committerdate --format='%(committerdate:unix)|%(refname:short)' refs/remotes/origin/)
[ "$extra" -gt 0 ] && msgs+=("… et $extra autre(s) branche(s) GitHub récente(s) dans le même cas.")
[ "$count" -gt 0 ] && msgs+=("Ces branches ne sont PAS dans la version sur laquelle on travaille : le signaler, et demander avant toute fusion.")

# 3. Modifications locales non commitées.
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[ "$dirty" -gt 0 ] && msgs+=("$dirty fichier(s) modifié(s) non commités en local : penser à commit + push pour ne rien perdre.")

[ ${#msgs[@]} -eq 0 ] && exit 0

echo "RAPPEL SYNCHRO GIT (à résumer à l'utilisateur dès le début de la session, en français) :"
for m in "${msgs[@]}"; do echo "- $m"; done
exit 0
