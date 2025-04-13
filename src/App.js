import { useState, useRef } from "react";
import { sections } from "./texts";
import confetti from "canvas-confetti";

const sectionImages = {
  "Lines 1–11": "/images/latin1.png",
  "Lines 11–25": "/images/latin2.png",
  "Lines 26–35": "/images/latin3.png",
  "Lines 36–50": "/images/latin4.png",
  "Lines 50–63": "/images/latin5.png",
  "Lines 64–76": "/images/latin6.png",
};

function levenshtein(a, b) {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  matrix[0] = Array.from({ length: an + 1 }, (_, j) => j);
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

export default function App() {
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(null);
  const [selectedLineIdx, setSelectedLineIdx] = useState(null);
  const [practiceAll, setPracticeAll] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [userWords, setUserWords] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [showFinishedPopup, setShowFinishedPopup] = useState(false);

  const inputRef = useRef(null);

  const normalize = (str) =>
    str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,;:!?()]/g, "")
      .toLowerCase()
      .trim();

  const handleTyping = (e) => {
    const value = e.target.value;
    setCurrentWord(value);
  
    if (selectedSectionIdx === null) return;
  
    let targetText;
  
    if (practiceAll) {
      targetText = sections[selectedSectionIdx].fullEnglish.join(" ");
    } else {
      targetText = sections[selectedSectionIdx].groups[selectedLineIdx].english;
    }
  
    if (value.endsWith(" ")) {
      const targetWords = targetText.trim().split(/\s+/);
      const typed = normalize(value.trim());
      const correctWord = normalize(targetWords[userWords.length] || "");
  
      if (typed === correctWord || levenshtein(typed, correctWord) <= 1) {
        setUserWords((prev) => [...prev, targetWords[userWords.length]]);
        setCurrentWord("");
        setFeedback("Correct");
        
        if (userWords.length + 1 === targetWords.length) {
          setShowFinishedPopup(true);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      } else {
        setFeedback("Try again.");
        if (!feedback.startsWith("Try again")) {
          setMistakes((prev) => prev + 1);
        }
        setCurrentWord("");
      }
  
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleHint = () => {
    if (selectedSectionIdx === null) return;

    const targetText = practiceAll
      ? sections[selectedSectionIdx].fullEnglish.join(" ")
      : sections[selectedSectionIdx].fullEnglish[selectedLineIdx];

    const targetWords = targetText.trim().split(/\s+/);
    if (userWords.length < targetWords.length) {
      const firstLetter = targetWords[userWords.length][0];
      setFeedback(`Hint: starts with "${firstLetter}"`);
    }
  };

  const handleStartOver = () => {
    setSelectedSectionIdx(null);
    setSelectedLineIdx(null);
    setPracticeAll(false);
    setCurrentWord("");
    setUserWords([]);
    setFeedback("");
    setMistakes(0);
  };

  const progress = (() => {
    if (selectedSectionIdx === null) return 0;
    if (!sections[selectedSectionIdx]) return 0;
  
    const targetText = practiceAll
      ? sections[selectedSectionIdx].fullEnglish.join(" ")
      : sections[selectedSectionIdx].fullEnglish[selectedLineIdx] || "";
  
    const totalWords = targetText.trim().split(/\s+/).length;
    if (totalWords === 0) return 0;
  
    const safeProgress = Math.min((userWords.length / totalWords) * 100, 100);
    return Math.round(safeProgress);
  })();

  const formatLatin = () => {
    if (selectedSectionIdx === null) return "";
  
    const lines = practiceAll
      ? sections[selectedSectionIdx].groups.map(g => g.latin.join(" "))
      : [sections[selectedSectionIdx].groups[selectedLineIdx].latin.join(" ")];
  
    const properNames = ["Messalina", "Claudius", "Britannicus", "Silius", "Lepida", "Narcissus", "Lucullus", "Ostia", "Calpurnia"];
  
    const formattedLines = lines.map((line) => {
      const trimmedLine = line.trim();
      const words = trimmedLine.split(/\s+/);
  
      const correctedWords = words.map(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        return properNames.includes(cleanWord)
          ? cleanWord
          : word;
      });
  
      const finalLine = correctedWords.join(" ");
      return finalLine;
    });
  
    if (practiceAll) {
      return formattedLines.join("\n");
    } else {
      return formattedLines.join(" ");
    }
  };

  return (
    <div style={{
      padding: "30px",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      lineHeight: "1.6"
    }}>
      {selectedSectionIdx === null && (
        <div>
          <h2 style={{ fontWeight: "600", fontSize: "28px", marginBottom: "20px", textAlign: "center" }}>
            Choose a Set Text
          </h2>

          {[
            { title: "Baucis and Philemon", start: 0, end: 6, remove: "" },
            { title: "Messalina", start: 6, end: sections.length, remove: "Messalina " }
          ].map((group, groupIdx) => (
            <div key={groupIdx} style={{ marginBottom: "40px" }}>
              <h3 style={{ fontWeight: "500", fontSize: "24px", marginBottom: "15px", textAlign: "center" }}>
                {group.title}
              </h3>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "30px"
              }}>
                {sections.slice(group.start, group.end).map((section, idx) => (
                  <button
                    key={group.start + idx}
                    onClick={() => setSelectedSectionIdx(group.start + idx)}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "16px",
                      minWidth: "150px",
                      textAlign: "center"
                    }}
                  >
                    {section.label.replace(group.remove, "")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSectionIdx !== null && selectedLineIdx === null && !practiceAll && (
        <div>
          <h2 style={{ fontWeight: "600", fontSize: "24px", marginBottom: "20px" }}>
            Choose a Line
          </h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "30px"
          }}>
            <button
              onClick={() => {
                const randomIdx = Math.floor(Math.random() * sections[selectedSectionIdx].groups.length);
                setSelectedLineIdx(randomIdx);
                setUserWords([]);
                setCurrentWord("");
                setFeedback("");
                setMistakes(0);
              }}
              style={{
                padding: "12px 20px",
                backgroundColor: "#d0e0ff",
                border: "1px solid #8ba6d9",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "150px",
                textAlign: "center"
              }}
            >
              Random Practice Set
            </button>

            <button
              onClick={() => {
                setPracticeAll(true);
                setUserWords([]);
                setCurrentWord("");
                setFeedback("");
                setMistakes(0);
              }}
              style={{
                padding: "12px 20px",
                backgroundColor: "#d0ffd0",
                border: "1px solid #8bc34a",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "150px",
                textAlign: "center"
              }}
            >
              Practice All Lines
            </button>

            {sections[selectedSectionIdx].groups.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedLineIdx(idx);
                  setUserWords([]);
                  setCurrentWord("");
                  setFeedback("");
                  setMistakes(0);
                }}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  minWidth: "100px",
                  textAlign: "center"
                }}
              >
                Practice set {idx + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleStartOver}
            style={{
              marginTop: "10px",
              padding: "10px 16px",
              backgroundColor: "#ffe0e0",
              border: "1px solid #ffaaaa",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Start Over
          </button>
        </div>
      )}

      {(selectedLineIdx !== null || practiceAll) && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={handleStartOver}
              style={{
                padding: "10px 16px",
                backgroundColor: "#ffe0e0",
                border: "1px solid #ffaaaa",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Start Over
            </button>

            <button
              onClick={() => {
                setSelectedLineIdx(null);
                setPracticeAll(false);
                setUserWords([]);
                setCurrentWord("");
                setFeedback("");
                setMistakes(0);
              }}
              style={{
                padding: "10px 16px",
                backgroundColor: "#e0f7fa",
                border: "1px solid #00bcd4",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Choose Another Line
            </button>
          </div>

          <h2>Latin:</h2>
          {practiceAll && sectionImages[sections[selectedSectionIdx].label] ? (
            <img
              src={sectionImages[sections[selectedSectionIdx].label]}
              alt="Latin passage"
              style={{
                width: "100%",
                margin: "0 auto",
                display: "block",
                maxWidth: "800px",
                borderRadius: "10px",
              }}
            />
          ) : (
            <div
              style={{
                background: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "20px",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                marginBottom: "20px",
                fontFamily: "serif",
                textAlign: "center",
                lineHeight: "1.8"
              }}
              dangerouslySetInnerHTML={{ __html: formatLatin() }}
            />
          )}

          <h2>Your Translation:</h2>
          <pre style={{
            background: "#f9f9f9",
            padding: "15px",
            minHeight: "100px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          }}>
            {userWords.join(" ")}
          </pre>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type next English word, then space..."
            value={currentWord}
            onChange={handleTyping}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              marginTop: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <div style={{ marginTop: "15px" }}>
            <button onClick={handleHint} style={{
              marginRight: "10px",
              padding: "10px 16px",
              backgroundColor: "#e0e0e0",
              border: "1px solid #bbb",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px"
            }}>
              Hint
            </button>
            <span style={{ fontSize: "14px", color: "#555" }}>
              Mistakes: {mistakes}
            </span>
          </div>

          <p style={{ marginTop: "12px", fontSize: "18px", fontWeight: "600" }}>
            {feedback}
          </p>

          <div style={{
            background: "#ddd",
            height: "20px",
            width: "100%",
            marginTop: "25px",
            borderRadius: "10px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              background: "#4caf50",
              width: `${progress}%`,
              transition: "width 0.4s ease",
              borderRadius: "10px"
            }}></div>
          </div>

          <p style={{ textAlign: "center", marginTop: "8px", fontSize: "14px" }}>
            {progress}% complete
          </p>

          {showFinishedPopup && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}>
              <div style={{
                background: "#fff",
                padding: "30px 50px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 0 20px rgba(0,0,0,0.3)"
              }}>
                <h2 style={{ marginBottom: "20px" }}>🎉 You're finished! Great work!</h2>
                <button
                  onClick={() => setShowFinishedPopup(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
