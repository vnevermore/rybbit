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

**Troubleshooting**

- **ENOTFOUND postgres / clickhouse**: The backend can't resolve the database hostnames. Try in order:
  1. **Turn off Isolated Deployments** for this compose in Dokploy (General or Advanced) so all services share one network, then redeploy.
  2. **Use the host’s published ports** – When containers can’t resolve each other, the backend can reach Postgres and ClickHouse via the Docker host. The compose file adds `host.docker.internal` for the backend. In **Environment**, set:
     ```
     POSTGRES_HOST=host.docker.internal
     CLICKHOUSE_HOST=http://host.docker.internal:8123
     ```
     Save and redeploy. Postgres (5432) and ClickHouse (8123) are published to the host, so the backend will reach them via the host.
