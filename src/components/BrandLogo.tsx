import evertecLogo from "../assets/brand/evertec-logo.png";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-14 w-14 rounded-2xl",
};

export default function BrandLogo({
  className = "",
  imageClassName = "",
  label = "Logo de Evertec",
  size = "md",
}: BrandLogoProps) {
  return (
    <span
      className={`
        inline-flex shrink-0 items-center justify-center bg-white
        shadow-[0_14px_35px_-22px_rgba(245,110,37,0.75)]
        ring-1 ring-brand-100
        ${sizeClasses[size]} ${className}
      `}
    >
      <img
        src={evertecLogo}
        alt={label}
        className={`h-[78%] w-[78%] object-contain ${imageClassName}`}
      />
    </span>
  );
}
