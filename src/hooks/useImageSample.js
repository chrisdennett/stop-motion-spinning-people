import { useEffect } from "react";

export function useSampleImage(url, callback) {
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      callback(image);
    };
    image.src = url;
  }, [url, callback]);
}
