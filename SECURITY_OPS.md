# CasaOS — Segurança e operação

Este guia cobre três pontos que o documento do projeto pede antes de tratar o CasaOS
como pronto para usuários reais em volume: headers de segurança, backup e rate limiting.

## 1. Headers de segurança

Configurados no `vercel.json` — nenhuma ação manual necessária além de publicar
(`git push`). O que cada um faz:

| Header | Para que serve |
|---|---|
| `X-Content-Type-Options: nosniff` | Impede que o navegador tente "adivinhar" o tipo de um arquivo, o que pode ser abusado para executar conteúdo malicioso disfarçado. |
| `X-Frame-Options: DENY` | Impede que o CasaOS seja carregado dentro de um `<iframe>` em outro site — proteção contra clickjacking. |
| `Referrer-Policy: strict-origin-when-cross-origin` | Evita vazar a URL completa (que pode conter dados) para sites externos ao clicar em links de saída. |
| `Permissions-Policy` | Desliga explicitamente câmera, microfone e geolocalização — o CasaOS não usa nada disso, então nem deveria ter acesso solicitado por engano. |
| `Content-Security-Policy` | Define de onde o navegador pode carregar script, estilo, fonte e fazer requisições. Bloqueia por padrão qualquer origem não listada. |

### Testar depois de publicar

1. Rode `git add . && git commit -m "Headers de segurança" && git push`.
2. Depois do deploy, abra o CasaOS publicado e teste o app normalmente — login, Bens, Garantias, upload de documento.
3. Se algo parar de funcionar (ex: fonte não carrega, upload falha), abra o DevTools (F12) > Console. Erros de CSP aparecem claramente ali, dizendo exatamente o que foi bloqueado. Me manda a mensagem que eu ajusto a política.
4. Ferramenta rápida pra conferir: https://securityheaders.com — cole a URL do seu app publicado e veja a nota.

## 2. Backup

**Realidade confirmada do plano gratuito do Supabase: não existe backup automático.**
Nem diário, nem point-in-time — isso é exclusivo dos planos pagos. Também confirmei que
projetos gratuitos podem ser **pausados** após um período de baixa atividade (atualmente
em torno de uma semana, mas esse número pode mudar — confira no seu painel se aparecer
algum aviso). Pausado não é igual a apagado: os dados continuam existindo, só ficam
congelados até você clicar em "restaurar" no painel. Mas backup de verdade, você precisa
fazer por conta própria.

### Backup manual gratuito

Você já tem o Node.js instalado (usa pra rodar o projeto), então dá pra usar a própria
CLI do Supabase via `npx`, sem instalar nada permanente:

```
npx supabase db dump --db-url "SUA_CONNECTION_STRING" -f backup-$(date +%Y-%m-%d).sql
```

Onde conseguir a `SUA_CONNECTION_STRING`: painel do Supabase > **Project Settings > Database**
> seção de conexão, copie a URI completa (algo como `postgresql://postgres:...@...`).
**Trate essa string como uma senha** — nunca cole ela em nenhum arquivo que vá pro Git.

Isso gera um arquivo `.sql` com todo o conteúdo do banco: tabelas, dados, políticas de
RLS, tudo. Guarde esse arquivo em algum lugar fora do Supabase — no seu computador, e
idealmente também em algum serviço de nuvem que você já use (Google Drive, por exemplo).

### Com que frequência

Para o estágio atual do projeto (uso pessoal, poucos dados), rodar isso manualmente
antes de qualquer mudança arriscada (ex: antes de testar uma migration nova) e a cada
uma ou duas semanas já é uma proteção razoável. Não precisa virar automação agora —
seria complexidade desnecessária para o volume de dados atual.

### Quando isso deixa de ser suficiente

Quando o CasaOS tiver usuários reais além de você, backup manual esporádico não é mais
adequado — nesse ponto, migrar pro plano Pro do Supabase (que inclui backup diário
automático) deixa de ser opcional. Trate isso como um gatilho de decisão de negócio, não
como algo pra fazer agora.

## 3. Rate limiting

O Supabase Auth já vem com limites embutidos nos endpoints de autenticação — não é algo
que falta construir, é algo que vale revisar e, se quiser, reforçar.

### Onde revisar

Painel do Supabase > **Authentication > Rate Limits**. Lá aparecem limites configuráveis
para: tentativas de login/cadastro, envio de OTP/magic link, atualização de token, entre
outros. Os valores padrão já existem — não precisa criar nada do zero, só confirmar que
estão em valores que fazem sentido (os padrões do Supabase já são razoáveis para a
maioria dos casos).

### Um detalhe que já te afeta

O envio de e-mail do Supabase Auth (o mesmo que manda confirmação de cadastro e
recuperação de senha) tem um limite padrão de **2 e-mails por hora** quando você usa o
serviço de e-mail embutido do Supabase (sem SMTP próprio configurado). Isso explica por
que, se você testar cadastro ou recuperação de senha repetidas vezes em sequência, pode
começar a receber erro de limite excedido — não é bug do CasaOS, é essa proteção agindo.
Para o estágio atual (só você testando), isso não atrapalha. Quando o CasaOS tiver
usuários reais criando conta com mais frequência, configurar um SMTP próprio (ex: Resend,
já que você já tem conta lá) resolve isso — mas essa é uma decisão pra quando o volume
justificar, não agora.

### Camada extra opcional: CAPTCHA

O Supabase também oferece proteção por CAPTCHA nos endpoints de cadastro, login e
recuperação de senha, gratuita, configurável em **Authentication > Attack Protection**.
Não é obrigatório agora — mas se você notar tentativas automatizadas de criação de
conta no futuro, é a primeira coisa gratuita a ativar antes de considerar qualquer
solução paga.
