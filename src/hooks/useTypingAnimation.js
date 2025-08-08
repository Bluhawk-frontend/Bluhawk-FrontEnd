import { useState, useRef, useEffect } from "react";

export default function useTypingAnimation(text, typingSpeed = 150, pauseTime = 3000, loop = false) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    if (!text) return;

    function typeChar() {
      const i = indexRef.current;
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        indexRef.current = i + 1;
        timeoutRef.current = setTimeout(typeChar, typingSpeed);
      } else if (loop) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed("");
          indexRef.current = 0;
          timeoutRef.current = setTimeout(typeChar, typingSpeed);
        }, pauseTime);
      }
    }

    timeoutRef.current = setTimeout(typeChar, typingSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [text, typingSpeed, pauseTime, loop]);

  return displayed;
}
