import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;
const MCP_TARGET = process.env.MCP_TARGET;
const MCP_TOKEN = process.env.MCP_TOKEN;

if (!MCP_TARGET || !MCP_TOKEN) {
  console.error("Variáveis MCP_TARGET e MCP_TOKEN são obrigatórias.");
  process.exit(1);
}

app.use(express.raw({ type: "*/*", limit: "10mb" }));

app.all("/mcp", async (req, res) => {
  try {
    const headers = { ...req.headers };
    delete headers.host;
    headers.authorization = `Bearer ${MCP_TOKEN}`;

    const response = await fetch(MCP_TARGET, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      redirect: "manual",
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "content-encoding") return;
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    if (!response.body) {
      return res.end();
    }

    for await (const chunk of response.body) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    res.status(500).json({
      error: "proxy_error",
      message: error.message,
    });
  }
});

app.get("/", (_req, res) => {
  res.send("MCP proxy online");
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
