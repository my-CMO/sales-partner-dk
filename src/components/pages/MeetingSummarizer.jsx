import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeetingSummarizer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [intervalSummaries, setIntervalSummaries] = useState([]);

  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(currentTranscript);

      if (currentTranscript.length > 500) {  // 500자 이상일 때 자동 요약
        summarizeInterval(currentTranscript);
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recognition.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognition.stop();
  };

  const summarizeInterval = async (text) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [
          {role: "system", content: "마케팅 미팅 내용의 일부를 요약해주세요."},
          {role: "user", content: `다음 회의 내용을 간략히 요약해주세요:\n\n${text}`}
        ],
      }, {
        headers: {
          'Authorization': `Bearer your key`,
          'Content-Type': 'application/json',
        },
      });

      const intervalSummary = response.data.choices[0].message.content.trim();
      setIntervalSummaries(prev => [...prev, intervalSummary]);
    } catch (error) {
      console.error('Error summarizing interval:', error);
    }
  };

  const summarizeMeeting = async () => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [
          {role: "system", content: "마케팅 미팅 전체 내용을 요약해주세요."},
          {role: "user", content: `다음 회의 내용을 종합적으로 요약해주세요:\n\n${transcript}`}
        ],
      }, {
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
      });

      setSummary(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error summarizing meeting:', error);
    }
  };

  return (
    <div>
      <h1>Meeting Summarizer</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>Recording Time: {Math.floor(recordingTime / 60)}:{recordingTime % 60 < 10 ? '0' : ''}{recordingTime % 60}</p>
      <button onClick={summarizeMeeting} disabled={isRecording || !transcript}>
        Summarize Meeting
      </button>
      <h2>Transcript:</h2>
      <p>{transcript}</p>
      <h2>Interval Summaries:</h2>
      {intervalSummaries.map((summary, index) => (
        <p key={index}>{summary}</p>
      ))}
      <h2>Final Summary:</h2>
      <p>{summary}</p>
    </div>
  );
};

export default MeetingSummarizer;