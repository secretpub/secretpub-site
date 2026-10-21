# Instructions Claude Code — secretpub-site

Voir aussi CONVENTIONS.md (règles de build).

## Synchronisation VS Code ⇄ cloud

Le projet est codé à la fois en local (VS Code) et dans des sessions Claude Code
cloud, qui poussent leur travail sur des branches GitHub séparées.
Un hook de démarrage (`.claude/hooks/sync-check.sh`) affiche un « RAPPEL SYNCHRO GIT ».

- En début de session, si ce rappel est présent : le résumer à l'utilisateur en
  premier, avant toute autre action.
- Branche courante en retard sur GitHub → proposer `git pull` avant de modifier quoi que ce soit.
- Branche GitHub récente absente de la branche courante → expliquer que ce travail
  n'est pas dans la version en cours (donc pas en ligne) et demander s'il faut la fusionner.
- Ne jamais écraser ni supprimer une branche distante sans accord explicite.
- En fin de travail : commit + push systématiques.
