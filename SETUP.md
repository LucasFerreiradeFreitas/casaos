# CasaOS — Setup do Supabase

## 1. Criar o projeto

1. Acesse https://supabase.com e crie uma conta (grátis).
2. Clique em **New project**.
3. Escolha uma organização, um nome para o projeto (ex: `casaos`) e uma senha forte para o banco — guarde essa senha em um lugar seguro, ela não aparece de novo.
4. Escolha a região mais próxima dos seus usuários (ex: São Paulo).
5. Aguarde a criação do projeto (leva alguns minutos).

Isso não tem custo: o projeto nasce no plano Free.

## 2. Pegar as credenciais

1. No painel do projeto, vá em **Project Settings > API**.
2. Copie:
   - **Project URL**
   - **anon public key**
3. Cole esses dois valores no seu `.env` (copiado a partir do `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Nunca copie a **service_role key** para esse arquivo. Ela tem acesso total ao banco e ignora RLS — só deve existir em ambiente de backend controlado, e o MVP do CasaOS não precisa dela em nenhum momento.

## 3. Rodar a migration

1. No painel, vá em **SQL Editor > New query**.
2. Abra o arquivo `supabase/migrations/0001_init_schema.sql` deste projeto.
3. Cole o conteúdo inteiro no editor.
4. Clique em **Run**.
5. Confirme que apareceu "Success. No rows returned" (ou similar), sem erros.

## 4. Confirmar que a RLS está ativa

1. Vá em **Table Editor**.
2. Para cada tabela (`homes`, `items`, `warranties`, `maintenances`), confira que aparece o indicador **RLS enabled**.
3. Vá em **Authentication > Policies** e confirme que cada tabela tem 4 políticas (select, insert, update, delete).

Se alguma tabela aparecer sem RLS habilitada, qualquer usuário autenticado conseguiria ler os dados de todos os outros — pare e revise antes de continuar.

## 5. Teste manual de isolamento (obrigatório antes de qualquer dado real)

Ainda não temos frontend, então este teste é feito direto no SQL Editor, simulando dois usuários.

1. Vá em **Authentication > Users** e crie dois usuários de teste (ex: `teste.a@casaos.dev` e `teste.b@casaos.dev`).
2. No **SQL Editor**, rode como *service role* (o editor do dashboard já roda com privilégios administrativos, então isso serve só para inserir os dados de teste):

```sql
insert into homes (user_id, name) values
  ('<uuid-do-usuario-a>', 'Casa A'),
  ('<uuid-do-usuario-b>', 'Casa B');
```

3. Depois, usando a API do projeto (via `curl` ou o cliente JS) autenticado **como usuário A**, tente buscar todas as homes:

```
GET /rest/v1/homes
Authorization: Bearer <access_token_do_usuario_A>
apikey: <anon_key>
```

Resultado esperado: só a "Casa A" deve aparecer. Se a "Casa B" aparecer, a RLS está incorreta.

4. Repita tentando um `UPDATE` e um `DELETE` na home do usuário B usando o token do usuário A. Resultado esperado: nenhuma linha afetada (não erro — RLS simplesmente não encontra a linha para esse usuário).

Só depois de validar esse comportamento devemos seguir para o frontend.

## 6. Rodar o projeto localmente

1. Instale as dependências:

```
npm install
```

2. Confirme que o `.env` está preenchido (passo 2 deste guia).

3. Suba o servidor de desenvolvimento:

```
npm run dev
```

4. Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`).

Você deve conseguir: ver a landing page em `/`, criar uma conta em `/cadastro`, confirmar o e-mail (o Supabase envia automaticamente), entrar em `/login` e ser redirecionado para `/app`. Se tentar acessar `/app` sem estar logado, deve ser redirecionado para `/login`.

## 7. Configurar o e-mail de confirmação (importante)

Por padrão, o Supabase exige confirmação de e-mail antes do primeiro login. No plano gratuito, o envio desses e-mails tem um limite baixo por hora — suficiente para testar, mas não para produção real. Quando o produto estiver perto de receber usuários de verdade, será necessário configurar um provedor de SMTP próprio (existem opções gratuitas, como Resend ou Brevo, dentro dos seus limites free). Por enquanto, para desenvolvimento, o padrão do Supabase já é suficiente.

## Próximos passos

Com autenticação funcionando de ponta a ponta, seguimos para:
- módulo **Minha Casa** (criar/editar a residência do usuário);
- CRUD de **Bens**;
- serviços de acesso ao banco (`src/services/`);
- limpeza dos dados de teste (`Casa A`, `Casa B` e os usuários fake) antes de qualquer uso real.
