@AGENTS.md

## Skills do projeto

Ficam em `.claude/skills/` e valem para qualquer sessão neste repositório (inclusive na web):

- `/grill-me`: entrevista sobre um plano ou ideia, em rodadas de perguntas numeradas, cada uma com a resposta recomendada. Use antes de implementar algo com decisões em aberto.
- `/grill-with-docs`: a mesma entrevista, mas registra o vocabulário do projeto em `CONTEXT.md` e as decisões difíceis de reverter em `docs/adr/`.
- `/handoff`: resume a conversa em um documento para outra sessão continuar o trabalho.

`grilling` e `domain-modeling` são usadas pelas skills acima; não chame diretamente.

Ao usar `/grill-me` ou `/grill-with-docs`, não escreva nem altere código até eu confirmar que chegamos a um entendimento comum.
