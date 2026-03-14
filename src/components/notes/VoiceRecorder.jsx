import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";

export default function VoiceRecorder({ onTranscript, onAudioReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText] = useState("");
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const finalTranscriptRef = useRef("");

  const startRecording = async () => {
    chunksRef.current = [];
    finalTranscriptRef.current = "";
    setLiveText("");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Brak dostępu do mikrofonu", err);
      return;
    }

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onAudioReady(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "pl-PL";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += t + " ";
          } else {
            interim = t;
          }
        }
        setLiveText(finalTranscriptRef.current + interim);
      };

      recognition.onend = () => {
        onTranscript(finalTranscriptRef.current.trim());
      };

      recognition.onerror = (e) => {
        console.warn("SpeechRecognition error:", e.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }

    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
          isRecording
            ? "bg-red-500 shadow-lg shadow-red-200 animate-pulse"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white fill-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {isRecording
          ? "Nagrywam... dotknij aby zatrzymać"
          : "Dotknij aby nagrać notatkę głosową"}
      </p>

      {liveText && (
        <div className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 min-h-[60px] leading-relaxed">
          {liveText}
        </div>
      )}
    </div>
  );
}
