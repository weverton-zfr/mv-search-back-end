import { executeSearch } from "../services/search.service.js";

const allowedModules = [
  "cpf",
  "phone",
  "cep",
  "cnpj",
  "cns",
  "title",
  "vizinhos",
  "veiculos",
  "proprietarios",
  "name",
  "mother",
  "father",
  "mail"
];

const numericModules = [
  "cpf",
  "phone",
  "cep",
  "cnpj",
  "cns",
  "title",
  "vizinhos",
  "veiculos",
  "proprietarios"
];

const minLengthByType = {
  cpf: 11,
  phone: 10,
  cep: 8,
  cnpj: 14,
  cns: 15,
  title: 12,
  vizinhos: 11,
  veiculos: 11,
  proprietarios: 11
};

export async function searchController(req, res) {
  try {
    const {
      modulo,
      consulta,
      vacinas,
      foto,
      sus,
      dataNascimento,
      cidade,
      uf
    } = req.query;

    if (!modulo || !consulta) {
      return res.status(400).json({
        success: false,
        error: "Módulo e consulta são obrigatórios."
      });
    }

    if (!allowedModules.includes(modulo)) {
      return res.status(400).json({
        success: false,
        error: "Tipo de consulta inválido."
      });
    }

    const cleanConsulta = numericModules.includes(modulo)
      ? consulta.toString().replace(/\D/g, "")
      : consulta.toString().trim();

    const minLength = minLengthByType[modulo];

    if (minLength && cleanConsulta.length < minLength) {
      return res.status(400).json({
        success: false,
        error: `Digite todos os ${minLength} números para realizar esta consulta.`
      });
    }

    const params = {
      modulo,
      consulta: cleanConsulta
    };

    if (modulo === "name") {
      if (dataNascimento) {
        params.dataNascimento = dataNascimento.toString().trim();
      }

      if (cidade) {
        params.cidade = cidade.toString().trim().toUpperCase();
      }

      if (uf) {
        params.uf = uf.toString().trim().toUpperCase();
      }
    }

    if (modulo === "cpf") {
      params.vacinas = vacinas === "on" ? "on" : "off";
      params.foto = foto === "on" ? "on" : "off";
      params.sus = sus === "on" ? "on" : "off";
    }

    const data = await executeSearch(params);

    return res.status(200).json(data);
  } catch (error) {
    console.error("SEARCH ERROR:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Erro ao realizar consulta."
    });
  }
}