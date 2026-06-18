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
  "veiculos"
];

const plateModules = ["proprietarios"];

const textModulesToUppercase = ["mother", "father"];

const minLengthByType = {
  cpf: 11,
  phone: 10,
  cep: 8,
  cnpj: 14,
  cns: 15,
  title: 12,
  vizinhos: 11,
  veiculos: 11,
  proprietarios: 7
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

    const moduleType = modulo.toString().toLowerCase().trim();
    const rawConsulta = consulta.toString().trim();

    if (!allowedModules.includes(moduleType)) {
      return res.status(400).json({
        success: false,
        error: "Tipo de consulta inválido."
      });
    }

    const onlyNumbers = rawConsulta.replace(/\D/g, "");
    const onlyPlate = rawConsulta.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    const isNumericModule = numericModules.includes(moduleType);
    const isPlateModule = plateModules.includes(moduleType);

    const cleanConsulta = isNumericModule
      ? onlyNumbers
      : isPlateModule
        ? onlyPlate
        : textModulesToUppercase.includes(moduleType)
          ? rawConsulta.toUpperCase()
          : rawConsulta;

    const minLength = minLengthByType[moduleType];

    if (minLength && cleanConsulta.length < minLength) {
      return res.status(400).json({
        success: false,
        error: isPlateModule
          ? `Digite uma placa válida com ${minLength} caracteres.`
          : `Digite todos os ${minLength} números para realizar esta consulta.`
      });
    }

    const params = {
      modulo: moduleType,
      consulta: cleanConsulta
    };

    if (moduleType === "name") {
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

    if (moduleType === "cpf") {
      params.vacinas = vacinas === "on" ? "on" : "off";
      params.foto = foto === "on" ? "on" : "off";
      params.sus = sus === "on" ? "on" : "off";
    }

    console.log("PARAMS NORMALIZADOS:", params);

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