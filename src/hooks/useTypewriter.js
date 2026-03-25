import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text, speed = 30) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) {
      setDisplayText("");
      setIsTyping(false);
      return;
    }

    setDisplayText("");
    setIsTyping(true);
    
    let index = 0;
    const targetText = text;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (index < targetText.length) {
        setDisplayText(prev => targetText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timerRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  const skipTyping = () => {
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayText(text);
      setIsTyping(false);
    }
  };

  return { displayText, isTyping, skipTyping };
};
