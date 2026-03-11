import { useState, useRef, useEffect } from "react";
import { Button, Tooltip, message } from "antd";
import { Mic, MicOff, Volume2, VolumeX } from "@ant-design/icons";

interface VoiceInputProps {
  onTextReceived?: (text: string) => void;
  onAudioResponse?: (audioUrl: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({
  onTextReceived,
  onAudioResponse,
  disabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      
      if (event.results[0].isFinal && transcript.trim()) {
        onTextReceived?.(transcript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        message.error(`语音识别错误: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognition);

    return () => {
      recognition.abort();
    };
  }, [onTextReceived]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const speakText = async (text: string) => {
    if (!("speechSynthesis" in window)) {
      message.warning("浏览器不支持语音合成");
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to get a Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes("zh"));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!supported) {
    return (
      <Tooltip title="您的浏览器不支持语音输入">
        <Button type="text" icon={<MicOff />} disabled />
      </Tooltip>
    );
  }

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {/* Microphone Button */}
      <Tooltip title={isListening ? "停止录音" : "语音输入"}>
        <Button
          type="text"
          icon={isListening ? <Mic /> : <MicOff />}
          onClick={toggleListening}
          disabled={disabled}
          style={{
            color: isListening ? "#ff4d4f" : undefined,
            animation: isListening ? "pulse 1.5s infinite" : undefined,
          }}
        />
      </Tooltip>

      {/* Speaker Button */}
      <Tooltip title={isSpeaking ? "停止播放" : "语音播报回复"}>
        <Button
          type="text"
          icon={isSpeaking ? <VolumeX /> : <Volume2 />}
          onClick={isSpeaking ? stopSpeaking : () => {}}
          disabled={disabled}
        />
      </Tooltip>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
