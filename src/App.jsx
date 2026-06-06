import { useState, useEffect, useRef } from "react";

const INSTRUCTOR_NAME = "Your Instructor";

const AVAILABLE_SLOTS = {
  "Mon, Jun 9": ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
  "Tue, Jun 10": ["10:00 AM", "1:00 PM", "3:00 PM"],
  "Wed, Jun 11": ["9:00 AM", "12:00 PM", "2:00 PM", "5:00 PM"],
  "Thu, Jun 12": ["11:00 AM", "2:00 PM", "4:00 PM"],
  "Fri, Jun 13": ["9:00 AM", "10:00 AM", "3:00 PM"],
  "Sat, Jun 14": ["10:00 AM", "12:00 PM", "2:00 PM"],
};

const LESSON_TYPES = [
  { id: "beginner", label: "🚗 Beginner Lesson", duration: "60 min", price: "$65" },
  { id: "intermediate", label: "🛣️ Road Skills", duration: "60 min", price: "$65" },
  { id: "highway", label: "🛤️ Highway Driving", duration: "90 min", price: "$90" },
  { id: "test_prep", label: "📋 Test Preparation", duration: "90 min", price: "$90" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("welcome");
  const [userData, setUserData] = useState({});
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const bottomRef = useRef(null);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const botSay = async (text, delay = 800) => {
    setTyping(true);
    await sleep(delay);
    setTyping(false);
    addMessage({ from: "bot", text });
  };

  useEffect(() => {
    (async () => {
      await sleep(400);
      await botSay("👋 Hi there! I'm here to help you book a driving lesson.", 600);
      await sleep(300);
      await botSay("Let's get you on the road. First — what's your name?", 900);
      setStep("ask_name");
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage({ from: "user", text: trimmed });
    setInput("");

    if (step === "ask_name") {
      const name = trimmed.split(" ")[0];
      setUserData((prev) => ({ ...prev, name }));
      await botSay(`Nice to meet you, ${name}! 😊`, 700);
      await botSay("What's the best phone number or email to reach you?", 900);
      setStep("ask_contact");
    } else if (step === "ask_contact") {
      setUserData((prev) => ({ ...prev, contact: trimmed }));
      await botSay("Got it! 📱", 500);
      await botSay("Now, what type of lesson are you looking for?", 800);
      setStep("ask_lesson");
    } else if (step === "ask_notes") {
      setUserData((prev) => ({ ...prev, notes: trimmed }));
      await botSay("Perfect, noted! 📝", 600);
      await botSay("Let me confirm your booking...", 800);
      await showConfirmation();
    }
  };

  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    setUserData((prev) => ({ ...prev, lesson }));
    addMessage({ from: "user", text: lesson.label });
    await botSay(`Great choice! ${lesson.duration}, ${lesson.price}. 👍`, 700);
    await botSay("Which day works for you?", 900);
    setStep("ask_date");
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setUserData((prev) => ({ ...prev, date }));
    addMessage({ from: "user", text: date });
    await botSay(`${date} — nice! Now pick a time slot:`, 700);
    setStep("ask_time");
  };

  const handleTimeSelect = async (time) => {
    setSelectedTime(time);
    setUserData((prev) => ({ ...prev, time }));
    addMessage({ from: "user", text: time });
    await botSay("Almost done! 🎉", 600);
    await botSay("Any notes for your instructor? (e.g. nervous beginner, specific area) — or just say 'none'", 900);
    setStep("ask_notes");
  };

  const showConfirmation = async () => {
    setStep("confirmed");
    await sleep(1200);
    setTyping(false);
    addMessage({ from: "bot", type: "confirmation" });
    await sleep(400);
    await botSay("You're all set! 🚗✨ A confirmation has been sent to you. See you on the road!", 600);
    setStep("done");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const canType = ["ask_name", "ask_contact", "ask_notes"].includes(step);

  return (
    <div style={styles.root}>
      <style>{css}</style>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>🚗</div>
          <div>
            <div style={styles.headerName}>DriveBook</div>
            <div style={styles.headerStatus}>
              <span style={styles.dot} /> Online
            </div>
          </div>
        </div>
        <div style={styles.headerTag}>Driving Lessons</div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => {
          if (msg.type === "confirmation") {
            return (
              <div key={i} style={styles.confirmCard}>
                <div style={styles.confirmTitle}>✅ Booking Confirmed!</div>
                <div style={styles.confirmRow}><span>👤 Name</span><span>{userData.name}</span></div>
                <div style={styles.confirmRow}><span>📞 Contact</span><span>{userData.contact}</span></div>
                <div style={styles.confirmRow}><span>🎓 Lesson</span><span>{userData.lesson?.label}</span></div>
                <div style={styles.confirmRow}><span>📅 Date</span><span>{userData.date}</span></div>
                <div style={styles.confirmRow}><span>⏰ Time</span><span>{userData.time}</span></div>
                <div style={styles.confirmRow}><span>💰 Price</span><span>{userData.lesson?.price}</span></div>
                {userData.notes && userData.notes.toLowerCase() !== "none" && (
                  <div style={styles.confirmRow}><span>📝 Notes</span><span>{userData.notes}</span></div>
                )}
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(msg.from === "user" ? styles.userBubble : styles.botBubble),
              }}
              className="bubble-in"
            >
              {msg.text}
            </div>
          );
        })}

        {typing && (
          <div style={{ ...styles.bubble, ...styles.botBubble }} className="bubble-in">
            <span style={styles.typingDots}>
              <span /><span /><span />
            </span>
          </div>
        )}

        {/* Step-specific quick replies */}
        {step === "ask_lesson" && !typing && (
          <div style={styles.quickGrid} className="bubble-in">
            {LESSON_TYPES.map((l) => (
              <button key={l.id} style={styles.lessonBtn} onClick={() => handleLessonSelect(l)}>
                <div style={styles.lessonLabel}>{l.label}</div>
                <div style={styles.lessonMeta}>{l.duration} · {l.price}</div>
              </button>
            ))}
          </div>
        )}

        {step === "ask_date" && !typing && (
          <div style={styles.dateGrid} className="bubble-in">
            {Object.keys(AVAILABLE_SLOTS).map((d) => (
              <button key={d} style={styles.dateBtn} onClick={() => handleDateSelect(d)}>
                {d}
              </button>
            ))}
          </div>
        )}

        {step === "ask_time" && selectedDate && !typing && (
          <div style={styles.timeGrid} className="bubble-in">
            {AVAILABLE_SLOTS[selectedDate].map((t) => (
              <button key={t} style={styles.timeBtn} onClick={() => handleTimeSelect(t)}>
                {t}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={{ ...styles.input, opacity: canType ? 1 : 0.4 }}
          placeholder={canType ? "Type your message..." : "Choose an option above ↑"}
          value={input}
          disabled={!canType}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          style={{ ...styles.sendBtn, opacity: canType && input.trim() ? 1 : 0.4 }}
          onClick={handleSend}
          disabled={!canType || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0d0d0d",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  header: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #ffffff12",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 44, height: 44,
    background: "linear-gradient(135deg, #f97316, #ef4444)",
    borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22,
  },
  headerName: { color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" },
  headerStatus: { color: "#4ade80", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginTop: 2 },
  dot: {
    width: 7, height: 7,
    background: "#4ade80",
    borderRadius: "50%",
    display: "inline-block",
    boxShadow: "0 0 6px #4ade80",
  },
  headerTag: {
    background: "#ffffff0f",
    color: "#f97316",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid #f9731630",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  messages: {
    flex: 1,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  bubble: {
    maxWidth: "78%",
    padding: "11px 15px",
    borderRadius: 18,
    fontSize: 14.5,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  botBubble: {
    background: "#1e1e2e",
    color: "#e2e2f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    border: "1px solid #ffffff10",
  },
  userBubble: {
    background: "linear-gradient(135deg, #f97316, #ef4444)",
    color: "#fff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
    fontWeight: 500,
  },
  typingDots: {
    display: "flex", gap: 4, alignItems: "center", padding: "2px 0",
  },
  quickGrid: {
    display: "flex", flexDirection: "column", gap: 8, alignSelf: "flex-start", width: "90%",
  },
  lessonBtn: {
    background: "#1e1e2e",
    border: "1px solid #ffffff18",
    borderRadius: 14,
    padding: "12px 16px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    color: "#fff",
  },
  lessonLabel: { fontSize: 14, fontWeight: 600 },
  lessonMeta: { fontSize: 12, color: "#f97316", marginTop: 3 },
  dateGrid: {
    display: "flex", flexWrap: "wrap", gap: 8, alignSelf: "flex-start",
  },
  dateBtn: {
    background: "#1e1e2e",
    border: "1px solid #ffffff18",
    borderRadius: 10,
    padding: "9px 14px",
    cursor: "pointer",
    color: "#e2e2f0",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  timeGrid: {
    display: "flex", flexWrap: "wrap", gap: 8, alignSelf: "flex-start",
  },
  timeBtn: {
    background: "linear-gradient(135deg, #f9731620, #ef444420)",
    border: "1px solid #f9731640",
    borderRadius: 10,
    padding: "9px 16px",
    cursor: "pointer",
    color: "#f97316",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.15s",
  },
  confirmCard: {
    background: "linear-gradient(135deg, #1e1e2e, #16213e)",
    border: "1px solid #f9731640",
    borderRadius: 18,
    padding: "18px",
    alignSelf: "flex-start",
    width: "90%",
  },
  confirmTitle: {
    color: "#4ade80",
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 14,
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e2e2f0",
    fontSize: 13,
    padding: "6px 0",
    borderBottom: "1px solid #ffffff08",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    background: "#0d0d0d",
    borderTop: "1px solid #ffffff10",
    position: "sticky",
    bottom: 0,
  },
  input: {
    flex: 1,
    background: "#1e1e2e",
    border: "1px solid #ffffff15",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#e2e2f0",
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #f97316, #ef4444)",
    border: "none",
    borderRadius: 12,
    width: 46,
    height: 46,
    cursor: "pointer",
    color: "#fff",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.1s",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0d0d; }
  .bubble-in {
    animation: fadeUp 0.25s ease-out both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .bubble-in span span {
    display: inline-block;
    width: 7px; height: 7px;
    background: #6366f1;
    border-radius: 50%;
    animation: blink 1.2s infinite;
  }
  .bubble-in span span:nth-child(2) { animation-delay: 0.2s; }
  .bubble-in span span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
    40% { opacity: 1; transform: scale(1.1); }
  }
  button:hover { opacity: 0.85; transform: scale(0.98); }
  input:focus { border-color: #f9731660 !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ffffff20; border-radius: 4px; }
`;
