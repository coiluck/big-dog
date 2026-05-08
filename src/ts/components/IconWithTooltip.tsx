import { useState } from "react";
import "../../css/iconWithTooltip.css";

type IconWithTooltipProps = {
  imagePath: string;
  size: number;
  description: string;
};

export default function IconWithTooltip({ imagePath, size, description }: IconWithTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="icon-with-tooltip"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imagePath}
        alt={description}
        className="icon-with-tooltip-image"
        style={{ width: `${size}px`, height: "auto" }}
      />
      {isHovered && (
        <span className="icon-with-tooltip-description" role="tooltip">
          {description}
        </span>
      )}
    </span>
  );
}