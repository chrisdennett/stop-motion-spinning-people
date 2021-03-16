import React, { useState } from "react";
import { GetImageDetails } from "../helpers";
import styles from "./imgSelector.module.css";
import ThumbWithMarker from "./ThumbWithMarker";

const spriteHeight = 700;

export default function ImgSelector({
  setImgDataList,
  imgDataList,
  onImgSelect,
}) {
  const [totalFiles, setTotalFiles] = useState(null);

  const onFilesSelect = (e) => {
    const files = e.target.files;
    setTotalFiles((prev) => (prev += files.length));

    for (let f of files) {
      GetImageDetails(f, spriteHeight, (imgData) => {
        setImgDataList((prev) => {
          const newList = [...prev];
          newList.push(imgData);

          newList.sort((a, b) => (a.fileName > b.fileName ? 1 : -1));

          return newList;
        });
      });
    }
  };

  // this ensures onChange still fires if same file selected
  const onInputClick = (e) => (e.target.value = "");

  const onClearList = () => {
    setImgDataList([]);
  };

  return (
    <div className={styles.imgSelector}>
      <h2>Image Selector. {totalFiles} Files selected</h2>
      <button onClick={onClearList}>CLEAR</button>
      <label>Select Images: </label>
      <input
        id="filePicker"
        type="file"
        accept="image/*"
        onClick={onInputClick}
        onChange={onFilesSelect}
        multiple={true}
      />

      <div className={styles.thumbs}>
        {imgDataList.map((imgData, i) => (
          <ThumbWithMarker
            imgData={imgData}
            useThumb={true}
            key={i}
            onClick={() => onImgSelect(i)}
          />
        ))}
      </div>

      {/* {imgDataList.map((imgData) => [imgData.img])} */}
    </div>
  );
}
