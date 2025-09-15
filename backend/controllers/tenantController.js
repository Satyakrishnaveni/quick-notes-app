const Tenant = require("../models/Tenant");

const upgradePlan = async (req,res) => {
  const tenant = await Tenant.findOne({ slug: req.params.slug });
  if(!tenant) return res.status(404).json({ message:"Tenant not found" });
  tenant.plan = "Pro";
  await tenant.save();
  res.json({ message: `${tenant.name} upgraded to Pro plan` });
};

module.exports = { upgradePlan };
