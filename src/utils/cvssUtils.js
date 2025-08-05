export const getCvssBarColor = (score) => {
  if (score >= 9) return "bg-red-500";
  if (score >= 8) return "bg-orange-500";
  if (score >= 7) return "bg-orange-400";
  if (score >= 6) return "bg-yellow-400";
  if (score >= 5) return "bg-yellow-300";
  if (score >= 4) return "bg-yellow-200";
  if (score >= 3) return "bg-lime-300";
  if (score >= 2) return "bg-lime-400";
  if (score >= 1) return "bg-lime-500";
  return "bg-green-500";
};
