import React from "react";
import styles from "./thumbWithMarker.module.css";

export default function ThumbWithMarker({
  imgData,
  onClick,
  useThumb = false,
}) {
  const { point, thumb, img } = imgData;

  const canvas = useThumb ? thumb : img;

  const xPos = point.x * canvas.width;
  const yPos = point.y * canvas.height;

  return (
    <div className={styles.thumbWithMarker} onClick={onClick}>
      <svg width={canvas.width} height={canvas.height}>
        <circle cx={xPos} cy={yPos} r={3} fill="red" />
      </svg>
      <img src={canvas.toDataURL()} />
    </div>
  );
}
