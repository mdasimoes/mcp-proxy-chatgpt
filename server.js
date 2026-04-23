import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;
const MCP_TARGET = process.env.MCP_TARGET;
const MCP_TOKEN = process.env.MCP_TOKEN;

if (!MCP_TARGET || !MCP_TOKEN) {
  console.error("Variáveis MCP_TARGET e MCP_TOKEN são obrigatórias.");
  process.exit(1);
}

app.use(express.json({ limit: "10mb" }));

app.all("/mcp", async (req, res) => {
  try {
    const response = await fetch(MCP_TARGET, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MCP_TOKEN}`
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body)
    });

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    }

    const text = await response.text();
    return res.send(text);
  } catch (error) {
    return res.status(500).json({
      error: "proxy_error",
      message: error.message
    });
  }
});

app.get("/", (_req, res) => {
  res.send("MCP proxy online");
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
