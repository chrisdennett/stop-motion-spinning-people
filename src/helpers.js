const maxImageWidth = 800;
const maxImageHeight = 800;

export function getCanvasDimensions(imgData, cols, rows, spriteHeight) {
  let w = 0;
  let h = rows * spriteHeight;
  let i = 0;

  for (let r = 0; r < rows; r++) {
    let rowWidth = 0;
    for (let c = 0; c < cols; c++) {
      if (i < imgData.length) {
        const sprite = imgData[i];
        rowWidth += sprite.width;

        i++;
      }
    }

    if (rowWidth > w) {
      w = rowWidth;
    }
  }

  return { w, h };
}

// Returns an image element given a file
export function GetImageDetails(imgFile, height = 300, callback) {
  GetPhotoOrientation(imgFile, (orientation) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgSrc = e.target.result;
      // Create a new image element
      let img = new Image();
      img.setAttribute("crossOrigin", "anonymous"); //
      img.src = imgSrc;

      // wait for it to be loaded and then return
      img.onload = (e) => {
        const w = img.width;
        const h = img.height;

        const wToHRatio = h / w;
        const hToWRatio = w / h;

        const spritesheetCanvas = document.createElement("canvas");
        const width = Math.floor(height * hToWRatio);
        spritesheetCanvas.height = height;
        spritesheetCanvas.width = width;
        const ctx = spritesheetCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h, 0, 0, width, height);

        const thumbCanvas = document.createElement("canvas");
        const thumbHeight = 200;
        const thumbWidth = Math.floor(thumbHeight * hToWRatio);
        thumbCanvas.height = thumbHeight;
        thumbCanvas.width = thumbWidth;
        const thumbCtx = thumbCanvas.getContext("2d");
        thumbCtx.drawImage(img, 0, 0, w, h, 0, 0, thumbWidth, thumbHeight);

        callback({
          img: spritesheetCanvas,
          thumb: thumbCanvas,
          fileName: imgFile.name,
          orientation,
          wToHRatio,
          hToWRatio,
          width,
          height,
          point: { x: 0, y: 0 },
        });
      };
    };
    reader.readAsDataURL(imgFile);
  });
}

export function GetImageFromUrl(imgUrl, callback) {
  const imgSrc = imgUrl;
  // Create a new image element
  let img = new Image();
  img.setAttribute("crossOrigin", "anonymous"); //
  img.src = imgSrc;

  // wait for it to be loaded and then return
  img.onload = (e) => {
    const w = img.width;
    const h = img.height;

    const widthToHeightRatio = h / w;
    const heightToWidthRatio = w / h;

    callback(img, widthToHeightRatio, heightToWidthRatio);
  };
}

// Reads file as Array buffer to get camera orientation from exif data
function GetPhotoOrientation(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const view = new DataView(e.target.result);

    if (view.getUint16(0, false) !== 0xffd8) return callback(-2);
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      let marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        offset += 2;
        if (view.getUint32(offset, false) !== 0x45786966) return callback(-1);

        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + i * 12, little) === 0x0112)
            return callback(view.getUint16(offset + i * 12 + 8, little));
      } else if ((marker & 0xff00) !== 0xff00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file);
}

// Draws an image to a canvas restricting to a specific size
export function drawImageToCanvas(
  {
    sourceImg,
    outputCanvas,
    orientation,
    maxOutputCanvasWidth = maxImageWidth,
    maxOutputCanvasHeight = maxImageHeight,
  },
  callback
) {
  const isPortrait = orientation > 4 && orientation < 9;

  // if portrait the final canvas dimensions will be the other way round
  const canvasH = isPortrait ? sourceImg.width : sourceImg.height;
  const canvasW = isPortrait ? sourceImg.height : sourceImg.width;

  const widthToHeightRatio = canvasH / canvasW;
  const heightToWidthRatio = canvasW / canvasH;

  let outputCanvasWidth = Math.min(canvasW, maxOutputCanvasWidth);
  let outputCanvasHeight = outputCanvasWidth * widthToHeightRatio;

  if (outputCanvasHeight > maxOutputCanvasHeight) {
    outputCanvasHeight = maxOutputCanvasHeight;
    outputCanvasWidth = outputCanvasHeight * heightToWidthRatio;
  }

  outputCanvas.width = outputCanvasWidth;
  outputCanvas.height = outputCanvasHeight;

  const ctx = outputCanvas.getContext("2d");

  // save the context so it can be reset after transform
  ctx.save();
  // transform context before drawing image
  switch (orientation) {
    case 2:
      // flipped horizontally
      ctx.transform(-1, 0, 0, 1, canvasH, 0);
      break;
    case 3:
      // rotated 180°
      ctx.transform(-1, 0, 0, -1, canvasW, canvasH);
      break;
    case 4:
      // flipped horizontally and rotated 180°
      ctx.transform(1, 0, 0, -1, 0, canvasW);
      break;
    case 5:
      // flipped horizontally and rotated 270°
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      // rotated 90°
      ctx.transform(0, 1, -1, 0, canvasW, 0);
      break;
    case 7:
      // flipped horizontally and rotated 90°
      ctx.transform(0, -1, -1, 0, canvasW, canvasH);
      break;
    case 8:
      // rotated 270°
      ctx.transform(0, -1, 1, 0, 0, canvasH);
      break;
    default:
      break;
  }

  ctx.drawImage(sourceImg, 0, 0, outputCanvasWidth, outputCanvasHeight);
  // restore ensures resets transform in case another image is added
  ctx.restore();

  if (callback) callback(outputCanvasWidth, outputCanvasHeight);
}

// Draws one canvas to another restricting to a specific size
export function drawToCanvas(sourceCanvas, outputCanvas) {
  const ctx = outputCanvas.getContext("2d");
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  // draw image: context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
  ctx.drawImage(
    sourceCanvas,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  );
}

// Draws one canvas to another restricting to a specific size
export function drawStretchyToCanvas(
  sourceCanvas,
  outputCanvas,
  stretchBy,
  stretchByY,
  xPosRequested,
  yPosRequested,
  isShowingStretchLines
) {
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;

  const xPos = xPosRequested < sourceWidth ? xPosRequested : xPosRequested - 1;
  const yPos = yPosRequested < sourceHeight ? yPosRequested : yPosRequested - 1;

  const outputCtx = outputCanvas.getContext("2d");

  // draw corners
  // top left
  outputCtx.drawImage(sourceCanvas, 0, 0, xPos, yPos, 0, 0, xPos, yPos);
  // bottom left
  outputCtx.drawImage(
    sourceCanvas,
    0,
    yPos,
    xPos,
    sourceHeight,
    0,
    yPos + stretchByY,
    xPos,
    sourceHeight
  );
  // top right
  outputCtx.drawImage(
    sourceCanvas,
    xPos,
    0,
    sourceWidth,
    yPos,
    xPos + stretchBy,
    0,
    sourceWidth,
    yPos
  );
  // bottom right
  outputCtx.drawImage(
    sourceCanvas,
    xPos,
    yPos,
    sourceWidth,
    sourceHeight,
    xPos + stretchBy,
    yPos + stretchByY,
    sourceWidth,
    sourceHeight
  );

  // stretchy bits
  // top
  outputCtx.drawImage(sourceCanvas, xPos, 0, 1, yPos, xPos, 0, stretchBy, yPos);
  // bottom
  outputCtx.drawImage(
    sourceCanvas,
    xPos,
    yPos,
    1,
    sourceHeight,
    xPos,
    yPos + stretchByY,
    stretchBy,
    sourceHeight
  );
  // left
  outputCtx.drawImage(
    sourceCanvas,
    0,
    yPos,
    xPos,
    1,
    0,
    yPos,
    xPos,
    stretchByY
  );
  // right
  outputCtx.drawImage(
    sourceCanvas,
    xPos,
    yPos,
    sourceWidth,
    1,
    xPos + stretchBy,
    yPos,
    sourceWidth,
    stretchByY
  );
  // middle
  outputCtx.drawImage(
    sourceCanvas,
    xPos,
    yPos,
    1,
    1,
    xPos,
    yPos,
    stretchBy,
    stretchByY
  );

  if (isShowingStretchLines) {
    outputCtx.strokeStyle = "#FF0000";
    outputCtx.moveTo(xPos, 0);
    outputCtx.lineTo(xPos, outputCanvas.height);

    outputCtx.moveTo(xPos + stretchBy, 0);
    outputCtx.lineTo(xPos + stretchBy, outputCanvas.height);

    outputCtx.moveTo(0, yPos);
    outputCtx.lineTo(outputCanvas.width, yPos);

    outputCtx.moveTo(0, yPos + stretchByY);
    outputCtx.lineTo(outputCanvas.width, yPos + stretchByY);

    outputCtx.stroke();
  }
}
