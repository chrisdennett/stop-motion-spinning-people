import React, { useRef } from "react";
import ThumbWithMarker from "../imgSelector/ThumbWithMarker";
import styles from "./imagePointEditor.module.css";

export default function ImagePointEditor({ imgData, onSetMarker, imgIndex }) {
  const canvasRef = useRef(null);
  if (!imgData || !imgData.fileName) return null;

  const onImgClick = (e) => {
    const { width, height, top, left } = e.target.getBoundingClientRect();
    const { clientX, clientY } = e;

    const xPos = clientX - left;
    const yPos = clientY - top;

    const xFraction = xPos / width;
    const yFraction = yPos / height;

    const newImg = { ...imgData, point: { x: xFraction, y: yFraction } };

    onSetMarker(imgIndex, newImg);
  };

  const { point, wToHRatio } = imgData;
  const displayWidth = 300;
  const displayHeight = displayWidth * wToHRatio;
  const xPos = point.x * displayWidth;
  const yPos = point.y * displayHeight;

  console.log("imgData: ", imgData);

  return (
    <div className={styles.imagePointEditor}>
      <h2>Image Alignment</h2>
      <ThumbWithMarker imgData={imgData} onClick={onImgClick} />
    </div>
  );
}
