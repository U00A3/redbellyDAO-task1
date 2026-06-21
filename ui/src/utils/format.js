export function maskAddress(address) {
  if (!address) return "n/a";
  const normalized = address.toLowerCase();
  return `${normalized.slice(0, 6)}∴⟡∴${normalized.slice(-4)}`;
}

export function formatTokenAmount(value) {
  if (value === undefined || value === null) return "n/a";
  const whole = value / 10n ** 18n;
  const frac = value % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}
