# Deploy Rybbit on Dokploy via GitHub

Quick reference for deploying this repo on [Dokploy](https://dokploy.com) with GitHub. Full guide: [Self-Hosting Guides → Dokploy](https://rybbit.com/docs/self-hosting-guides/dokploy).

## Steps

1. **Connect GitHub**  
   Dokploy → **Git** → **GitHub** → **Create Github App** → name it (e.g. `Dokploy-Rybbit`) → **Install** → choose repo(s).

2. **Create Docker Compose service**  
   **Docker Compose** → New → **General**:
   - Source: **GitHub**, pick this repo and branch (e.g. `master`).
   - Docker Compose path: `docker-compose.yml`.

3. **Set environment variables**  
   In the **Environment** tab, add at least:
   - `DOMAIN_NAME`, `BASE_URL`, `BETTER_AUTH_SECRET`
   - `POSTGRES_*`, `CLICKHOUSE_*` (see [.env.example](.env.example)).
   - Use `HOST_BACKEND_PORT=3001:3001` and `HOST_CLIENT_PORT=3002:3002` (or leave unset). Set `DISABLE_TELEMETRY=true` or `false` to avoid the unset warning.

4. **Deploy**  
   Save → **Deploy**. First build may take several minutes.

5. **Optional: Caddy**  
   To use the built-in Caddy reverse proxy, in **Advanced** append `--profile with-webserver` to the compose command (or equivalent in your Dokploy UI).

Auto-deploy on push is on by default for the selected branch. Webhook URL is in **Deployments** if you need it.

**Troubleshooting:** If you see "endpoint not found" or gateway errors, the compose uses only the internal `rybbit` network (no external dokploy-network). If the backend still can't resolve `postgres`/`clickhouse` (ENOTFOUND), try disabling **Isolated Deployments** for this Docker Compose service in Dokploy (General or Advanced) so all services share the same network.
