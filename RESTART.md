# Restart checklist

## 1. Tunnel cloudflared (nouveau terminal)
```sh
cloudflared tunnel --url http://localhost:6676
```
Noter la nouvelle URL (`https://xxx.trycloudflare.com`) et l'éditer dans `fce-sign/.env` :
```
TUNNEL_URL="https://xxx.trycloudflare.com"
```

## 2. Docker stack
```sh
cd fce-sign
docker compose up -d
```

## 3. Réenregistrer le TEE
```sh
cd go/tools
go run ./cmd/allow-tee-version -p http://localhost:6676 -l
go run ./cmd/register-tee -p http://localhost:6676 -l
```

## 4. Charger la clé dans le TEE + vérifier
```sh
go run ./cmd/run-test -p http://localhost:6676
```
Doit se terminer par `All tests passed!`. La clé est maintenant chargée — le backend peut appeler le TEE.

## 5. Lancer le backend
```sh
cd ../../../  # reput-agent/
npm run dev
```

---

## Si le proxy ne démarre pas
Vérifier que `fce-sign/config/proxy/extension_proxy.toml` a les bons credentials DB :
```toml
username = "hackathon_user_7"
password = "NWoMeHdUy0wOZbHte2UTCht6"
```

## Si `allow-tee-version` ou `register-tee` rejette
Le TEE ID change à chaque restart Docker — c'est normal, refaire les steps 3-4.

## Si `FCE_LANGUAGE` n'est pas défini
Vérifier que `fce-sign/.env` contient `FCE_LANGUAGE=typescript` (pas `LANGUAGE=typescript`).
