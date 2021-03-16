import React, { useEffect, useRef, useState } from "react";
import styles from "./thumbAnimator.module.css";

export default function ThumbAnimator({ imgDataList }) {
  const [currFrame, setCurrFrame] = useState(0);
  const [framesPerSecond, setFramesPerSecond] = useState(9);

  const currInterval = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!imgDataList || imgDataList.length < 1) return;

    const imgData = imgDataList[0];
    const { img, point } = imgData;

    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);
  }, [imgDataList]);

  useEffect(() => {
    if (!imgDataList || imgDataList.length < 1) return;

    const imgData = imgDataList[currFrame];
    const { img, point } = imgData;

    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");

    const originPt = imgDataList[0].point;

    const offsetX = originPt.x * canvas.width - point.x * canvas.width;
    const offsetY = originPt.y * canvas.height - point.y * canvas.height;

    ctx.drawImage(img, offsetX, offsetY);
  }, [currFrame, imgDataList]);

  useEffect(() => {
    clearInterval(currInterval.current);

    currInterval.current = setInterval(() => {
      setCurrFrame((prev) => {
        if (prev + 1 < imgDataList.length) {
          return prev + 1;
        } else {
          return 0;
        }
      });
    }, 1000 / framesPerSecond);

    return () => clearInterval(currInterval.current);
  }, [framesPerSecond, imgDataList]);

  if (!imgDataList || imgDataList.length === 0) return null;

  return (
    <div className={styles.thumbAnimator}>
      <h1>
        Thumb Animator: {currFrame} of {imgDataList.length}
      </h1>
      <canvas ref={canvasRef} />
    </div>
  );
}
