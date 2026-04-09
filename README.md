# exam2_1_frontend

# Development Environment
```bash
docker compose -f Dockerfile-dev.yml up -d
```

```bash
npm install
```

```bash
npm run dev.frontend
```

```bash
http://localhost:3000
```


# Build Environment (Distribution)

```bash
npm run build.frontend
```

```bash
docker build --platform linux/arm64,linux/amd64 -t examples/frontend:0.0.1-SNAPSHOT .
```


# Runtime Environment 
```bash
docker compose -f Dockerfile-run.yml up -d
```

```bash
http://localhost:3000
```