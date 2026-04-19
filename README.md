# Agendamentos

Aplicação Next.js para marcação de horários: calendário público, disponibilidade com expediente e regras, e painel administrativo.

## Requisitos

- Node.js 20+
- MongoDB (local ou Atlas)

## Configuração

1. Copie as variáveis de ambiente (ex.: crie `.env.local`):

| Variável | Descrição |
|----------|-----------|
| `MONGODB_URI` | URI de ligação ao MongoDB (obrigatório) |
| `ADMIN_SESSION_SECRET` | **Obrigatório em produção** (mín. 32 caracteres aleatórios). Assina o JWT de sessão (HS256). Alterar invalida todas as sessões. Em desenvolvimento pode omitir-se e usar-se `ADMIN_PASSWORD` como fallback **apenas para assinar o JWT** (não é a senha de login). |
| `ADMIN_PASSWORD` | Opcional. Só em **desenvolvimento**: se `ADMIN_SESSION_SECRET` tiver menos de 32 caracteres, este valor substitui-o para derivar a chave JWT. **Não é a palavra-passe de nenhum utilizador.** |
| `ADMIN_SETUP_TOKEN` | **Primeiro utilizador:** em **produção**, ao criar o primeiro administrador (base vazia), o formulário deve enviar este token (igual ao valor desta variável). Em desenvolvimento é opcional se a variável estiver vazia. |

Os administradores são contas na coleção MongoDB (`AdminUser`: email + senha com hash **bcrypt**). Existe um papel **principal** (`role: owner`): o primeiro utilizador (bootstrap) e, em bases antigas, o utilizador mais antigo promovido automaticamente se faltar um `owner`. Só o principal pode **criar** novas contas e **ativar/desativar** outras; **ninguém** pode desativar a própria conta. Os restantes são `admin` e só alteram a própria senha. Novos admins são adicionados no separador **Equipa** pelo principal (`POST /api/admin/auth/change-password` para a própria senha).

2. Instale dependências e execute em desenvolvimento:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O admin está em `/admin/login`.

## MongoDB com Docker (opcional)

O repositório inclui `docker-compose.yml` com MongoDB na porta **27018** (apenas localhost). Exemplo de URI:

```text
MONGODB_URI=mongodb://admin:password123@127.0.0.1:27018/?authSource=admin
```

(Ajuste utilizador/palavra-passe ao que definir no compose.)

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run lint` — ESLint

## Notas

- Sessão admin: cookie **httpOnly** com **JWT** (`sub` = id, `sv` = `sessionVersion`). Ao mudar a senha, `sessionVersion` incrementa e **todas as outras sessões** desse utilizador deixam de ser válidas; a resposta renova a cookie. Chave HS256 derivada de `ADMIN_SESSION_SECRET` com SHA-256.
- Cabeçalhos de segurança globais em `next.config.ts` (frame, content-type, referrer, permissions-policy).
- Limitação de taxa de pedidos (rate limiting) deve ser configurada à frente da aplicação (CDN, API gateway, reverse proxy, etc.).
- Índices em `Appointment` são criados pelo Mongoose na primeira utilização do modelo.
