import React, { useState } from "react";
import { resolveLogoUrl, DEFAULT_LOGO } from "../utils/entryPhoto";

export const LogoImage: React.FC<{
  src?: string | null;
  alt?: string;
  className?: string;
}> = ({ src, alt = "Puntland BMS Logo", className = "h-16 w-auto object-contain" }) => {
  const [imgSrc, setImgSrc] = useState(resolveLogoUrl(src));

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(DEFAULT_LOGO)}
    />
  );
};
