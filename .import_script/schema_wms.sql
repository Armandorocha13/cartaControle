DROP TABLE IF EXISTS "historico_wms_sp";
CREATE TABLE "historico_wms_sp" (
  id SERIAL PRIMARY KEY,
  "empresa" TEXT,
  "nome_fantasia_empresa" TEXT,
  "tecnico" TEXT,
  "regional" TEXT,
  "grupo_produto" TEXT,
  "part_number" TEXT,
  "codigo" TEXT,
  "nome" TEXT,
  "unidade" TEXT,
  "quantidade" TEXT,
  "tipo" TEXT,
  "arquivo_origem" TEXT
);

DROP TABLE IF EXISTS "historico_wms_rj";
CREATE TABLE "historico_wms_rj" (
  id SERIAL PRIMARY KEY,
  "empresa" TEXT,
  "nome_fantasia_empresa" TEXT,
  "tecnico" TEXT,
  "regional" TEXT,
  "grupo_produto" TEXT,
  "part_number" TEXT,
  "codigo" TEXT,
  "nome" TEXT,
  "unidade" TEXT,
  "quantidade" TEXT,
  "tipo" TEXT,
  "arquivo_origem" TEXT
);

DROP TABLE IF EXISTS "historico_wms_outros";
CREATE TABLE "historico_wms_outros" (
  id SERIAL PRIMARY KEY,
  "empresa" TEXT,
  "nome_fantasia_empresa" TEXT,
  "tecnico" TEXT,
  "regional" TEXT,
  "grupo_produto" TEXT,
  "part_number" TEXT,
  "codigo" TEXT,
  "nome" TEXT,
  "unidade" TEXT,
  "quantidade" TEXT,
  "tipo" TEXT,
  "arquivo_origem" TEXT
);
