import templates from "../data/CDA_Templates/complete_cda_template_database.json";

export default function handler(req, res) {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(200).json({ templates });
  }

  const matches = templates.filter(t =>
    JSON.stringify(t).toLowerCase().includes(keyword.toLowerCase())
  );

  if (matches.length === 0) {
    return res.status(404).json({ message: "No templates found" });
  }

  res.status(200).json(matches);
}
