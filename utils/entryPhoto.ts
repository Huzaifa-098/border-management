const DEFAULT_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg";

export { DEFAULT_LOGO };

/** Entry applicant photo — backend URL or generated avatar fallback */
export function entryPhotoUrl(
  entry: { photoUrl?: string | null; fullName: string },
  size = 400
): string {
  const url = entry.photoUrl?.trim();
  if (url && url !== "null" && url !== "undefined") return url;
  const name = encodeURIComponent(entry.fullName || "Applicant");
  return `https://ui-avatars.com/api/?name=${name}&size=${size}&background=7c3aed&color=fff&bold=true`;
}

export function resolveLogoUrl(logo?: string | null): string {
  const url = logo?.trim();
  if (url && url !== "null") return url;
  return DEFAULT_LOGO;
}
