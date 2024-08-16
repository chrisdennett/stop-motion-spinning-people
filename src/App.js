import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import ImagePointEditor from "./imagePointEditor/ImagePointEditor";
import ImgSelector from "./imgSelector/ImgSelector";
import ThumbAnimator from "./thumbAnimator/ThumbAnimator";
import GifMaker from "./GifMaker";

function App() {
  const [currImgIndex, setCurrImgIndex] = useState(0);
  const [imgDataList, setImgDataList] = useState([]);

  const onSetMarker = (imgIndex, newImg) => {
    const newImgDataList = [...imgDataList];
    newImgDataList[imgIndex] = newImg;

    setImgDataList(newImgDataList);
  };

  const selectedImgData =
    imgDataList.length > 0 ? imgDataList[currImgIndex] : null;

  return (
    <div className="app">
      <ThumbAnimator imgDataList={imgDataList} />

      <ImgSelector
        setImgDataList={setImgDataList}
        imgDataList={imgDataList}
        onImgSelect={setCurrImgIndex}
      />

      <ImagePointEditor
        imgData={selectedImgData}
        onSetMarker={onSetMarker}
        imgIndex={currImgIndex}
      />

      <GifMaker />
    </div>
  );
}

export default App;
