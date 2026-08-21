# CasaOS — Deploy gratuito

## 1. Criar o repositório no GitHub

1. Acesse https://github.com/new.
2. Nome: `casaos` (ou o que preferir). Pode ser privado.
3. **Não** marque "Add a README" — já temos arquivos prontos.
4. Clique em **Create repository**.

## 2. Subir o código local

Na pasta do projeto (a mesma onde está o `package.json`), no terminal:

```
git init
git add .
git commit -m "MVP inicial do CasaOS"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/casaos.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub. O `.gitignore` já existe no projeto, então `node_modules` e o `.env` real não vão junto — só o `.env.example`.

## 3. Criar o projeto na Vercel

1. Acesse https://vercel.com e crie uma conta usando **login com GitHub** (mais simples, já autoriza o acesso ao repositório).
2. Clique em **Add New... > Project**.
3. Selecione o repositório `casaos`.
4. A Vercel deve detectar automaticamente **Vite** como framework. Confirme:
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 4. Configurar as variáveis de ambiente

Antes de clicar em **Deploy** (ou depois, em **Settings > Environment Variables**):

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | o mesmo do seu `.env` local |
| `VITE_SUPABASE_ANON_KEY` | o mesmo do seu `.env` local |

Marque para se aplicar em **Production**.

## 5. Deploy

Clique em **Deploy**. Depois de alguns segundos, a Vercel te dá uma URL do tipo `https://casaos-xxxx.vercel.app` — esse é o seu app no ar.

## 6. Avisar o Supabase sobre o novo domínio

Isso é obrigatório — sem esse passo, os e-mails de confirmação de cadastro e recuperação de senha continuam levando para `localhost`, que só existe na sua máquina.

1. No painel do Supabase, vá em **Authentication > URL Configuration**.
2. Em **Site URL**, coloque a URL da Vercel (ex: `https://casaos-xxxx.vercel.app`).
3. Em **Redirect URLs**, adicione:
   ```
   https://casaos-xxxx.vercel.app/**
   ```
   (o `/**` cobre todas as rotas, incluindo `/redefinir-senha`)
4. Salve.

## 7. Testar em produção

1. Abra a URL da Vercel em uma aba anônima (ou no celular).
2. Repita o teste completo: cadastro → confirmação de e-mail → login → onboarding → `/app`.
3. Confirme que o link do e-mail de confirmação agora aponta para o domínio da Vercel, não mais para `localhost`.

## Sobre custo e limites

O plano gratuito da Vercel cobre tranquilamente essa fase de validação (baixo tráfego, um projeto). Se o CasaOS crescer e passar dos limites do free tier, isso vira uma decisão de negócio (assinar um plano pago) — não uma necessidade técnica imediata.

## Deploys futuros

A partir de agora, todo `git push` para a branch `main` gera um novo deploy automático na Vercel. Não precisa repetir esses passos — só subir o código.
