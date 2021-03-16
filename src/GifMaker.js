import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";

export default function GifMaker() {
  const [gifSrc, setGifSrc] = useState("./test.gif");
  const [videoSrc, setVideoSrc] = useState("");
  const [message, setMessage] = useState("Click Start to transcode");
  const ffmpeg = createFFmpeg({
    log: true,
  });

  const framesPerSecond = "4";
  const totalImages = 8;

  const doTranscode = async () => {
    setMessage("Loading ffmpeg-core.js");
    await ffmpeg.load();
    setMessage("Start transcoding");

    // 600x1067

    for (let i = 0; i < totalImages; i++) {
      ffmpeg.FS(
        "writeFile",
        `pic-00${i}.jpg`,
        await fetchFile(`/orig/pic-00${i}.jpg`)
      );
    }

    ffmpeg.FS("writeFile", "anim.mp4", new Uint8Array());
    ffmpeg.FS("writeFile", "out.gif", new Uint8Array());

    // https://hamelot.io/visualization/using-ffmpeg-to-convert-a-set-of-images-into-a-video/
    // ffmpeg -r 60 -f image2 -s 1920x1080 -i pic%04d.png -vcodec libx264 -crf 25  -pix_fmt yuv420p test.mp4

    // -i benji.gif -f mp4 -pix_fmt yuv420p benji.mp4

    // transpose=1 rotates video 90 degrees
    //https://ostechnix.com/how-to-rotate-videos-using-ffmpeg-from-commandline/

    await ffmpeg.run(
      "-framerate",
      framesPerSecond,
      "-i",
      "pic-%03d.jpg",
      "-vf",
      "transpose=1",
      "anim.mp4"
    );

    // https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality
    // -i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
    // await ffmpeg.run("-i", "anim.mp4", "-loop", "0", "out.gif");

    await ffmpeg.run(
      "-i",
      "anim.mp4",
      "-vf",
      "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      "-loop",
      "0",
      "out.gif"
    );

    setMessage("Complete transcoding");
    const data = ffmpeg.FS("readFile", "anim.mp4");
    const src = new Blob([data.buffer], { type: "video/mp4" });

    const gifData = ffmpeg.FS("readFile", "out.gif");
    const gifSource = new Blob([gifData.buffer], { type: "image/gif" });

    setGifSrc(URL.createObjectURL(gifSource));
    setVideoSrc(URL.createObjectURL(src));
  };
  return (
    <div className="App">
      <img src={gifSrc} alt="" />
      <p />
      <video src={videoSrc} controls></video>
      <br />
      <button onClick={doTranscode}>Start</button>
      <p>{message}</p>
    </div>
  );
}
