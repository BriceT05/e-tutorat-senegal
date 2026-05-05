// Middleware générique : valide req.body avec un schéma Zod.
// Remplace req.body par les données parsées (champs inconnus strippés).
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      error: issue.message,
      ...(issue.path.length > 0 ? { field: issue.path.join('.') } : {}),
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
