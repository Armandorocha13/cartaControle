DROP TABLE IF EXISTS "forca_planilha1";
CREATE TABLE "forca_planilha1" (
  id SERIAL PRIMARY KEY,
  "nome_da_equipe" TEXT,
  "supervisor2" TEXT
);

DROP TABLE IF EXISTS "parametros_parametros";
CREATE TABLE "parametros_parametros" (
  id SERIAL PRIMARY KEY,
  "regional" TEXT,
  "cod__material" TEXT,
  "descricao" TEXT,
  "qtde_padrao" TEXT
);

DROP TABLE IF EXISTS "parametros_asd";
CREATE TABLE "parametros_asd" (
  id SERIAL PRIMARY KEY,
  "cod__supervisor" TEXT,
  "supervisor" TEXT,
  "equipe" TEXT,
  "n__f_r_e_" TEXT,
  "nome_da_equipe" TEXT,
  "conta_cliente" TEXT,
  "cod__material" TEXT,
  "desc__material" TEXT,
  "descricao_auxiliar" TEXT,
  "cod__cpl__aux" TEXT,
  "unidade" TEXT,
  "cod__compl_" TEXT,
  "grupo_de_material" TEXT,
  "recebido" TEXT,
  "devolucao" TEXT,
  "aplicado" TEXT,
  "removido" TEXT,
  "saldo" TEXT,
  "valor_unit_" TEXT,
  "total_r_" TEXT
);

