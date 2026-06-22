import { useEffect, useState } from "react";

function SmileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="11" fill="#f5c518"/>
      <circle cx="7.5" cy="9.5" r="1.5" fill="#1a1a1a"/>
      <circle cx="14.5" cy="9.5" r="1.5" fill="#1a1a1a"/>
      <path d="M7 13.5c1 2 7 2 8 0" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const FONT = '"Noto Sans", Arial, sans-serif';
const SLS_BLUE = "#4b63d4";
const SLS_BLUE_DARK = "#3448b8";

export default function Home() {
  const [showTop, setShowTop] = useState(false);
  const [mimsHovered, setMimsHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Main split panel */}
      <div id="top" style={{ display: "flex", minHeight: "100vh" }}>

        {/* Left panel */}
        <div style={{
          flex: "0 0 46%",
          background: "#162040",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          padding: "0 40px 0 56px",
          position: "relative",
          minHeight: "100vh",
        }}>
          {/* <img
            src="/sls-logo.png"
            alt="Singapore Student Learning Space"
            style={{ width: "clamp(210px, 24vw, 300px)", height: "auto", marginRight: "120px", marginTop: "-10px" }}
          /> */}
          <p style={{ color: "white", fontSize: "30px", margin: "16px 0 0 0", fontFamily: FONT }}>
            Student
          </p>
          <p style={{ color: "lightblue", fontSize: "30px", margin: "16px 0 0 0", fontFamily: FONT }}>
            Learning
          </p>
          <p style={{ color: "white", fontSize: "30px", margin: "16px 0 0 0", fontFamily: FONT }}>
            Space
          </p>
          <button
            onClick={() => {}}
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "#1d2c4a",
              color: "white",
              border: "none",
              borderRadius: "18px",
              padding: "8px 12px 8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Help us improve
            <SmileIcon />
          </button>
        </div>

        {/* Right panel */}
        <div style={{
          flex: 1,
          background: "#edf0f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}>
          {/* Login Card */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "36px 48px 40px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          }}>
            {/* Login icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <img src="/login-icon.png" alt="Login" style={{ width: "90px", height: "auto" }} />
            </div>

            {/* Login heading */}
            <h2 style={{
              textAlign: "center",
              fontSize: "22px",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 28px 0",
              fontFamily: FONT,
            }}>
              Login
            </h2>

            {/* LOGIN WITH SLS */}
            <button
              onClick={() => {}}
              style={{
                width: "100%",
                background: SLS_BLUE,
                color: "white",
                border: "none",
                borderRadius: "28px",
                padding: "14px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1.8px",
                cursor: "pointer",
                marginBottom: "12px",
                fontFamily: FONT,
                transition: "background 0.15s",
              }}
            >
              LOGIN WITH SLS
            </button>

            {/* LOGIN WITH MIMS */}
            <button
              onClick={() => {}}
              onMouseEnter={() => setMimsHovered(true)}
              onMouseLeave={() => setMimsHovered(false)}
              style={{
                width: "100%",
                background: mimsHovered ? SLS_BLUE_DARK : "white",
                color: mimsHovered ? "white" : SLS_BLUE,
                border: `1.5px solid ${mimsHovered ? SLS_BLUE_DARK : SLS_BLUE}`,
                borderRadius: "28px",
                padding: "13px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1.8px",
                cursor: "pointer",
                marginBottom: "28px",
                fontFamily: FONT,
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
            >
              LOGIN WITH MIMS
            </button>

            {/* Info box */}
            <div style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              background: "#f4f6fb",
              borderRadius: "8px",
              padding: "14px 16px",
            }}>
              <div style={{ flexShrink: 0, marginTop: "2px" }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="8" stroke={SLS_BLUE} strokeWidth="1.4"/>
                  <rect x="7.9" y="7" width="1.4" height="5.5" rx="0.7" fill={SLS_BLUE}/>
                  <circle cx="8.5" cy="5.2" r="0.85" fill={SLS_BLUE}/>
                </svg>
              </div>
              <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.65, margin: 0, fontFamily: FONT }}>
                If you have difficulties logging in or would like to apply for a new MIMS account, please refer to{" "}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: SLS_BLUE, textDecoration: "none" }}
                >
                  Accounts and Login Troubleshooting
                </a>{" "}
                for more information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#162040", color: "white", padding: "32px 44px 24px" }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px", fontFamily: FONT }}>
            Student Learning Space
          </div>
          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.12)", marginBottom: "16px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
            {["Login Troubleshooting", "Terms of Use", "Privacy Statement", "Report Vulnerability", "SLS Info Site"].map((label, idx, arr) => (
              <span key={label} style={{ display: "flex", alignItems: "center" }}>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "13px", fontFamily: FONT }}>
                  {label}
                </a>
                {idx < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 10px" }}>|</span>}
              </span>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, fontFamily: FONT }}>
            <a 
              href="/play?version=1.5.2" 
              style={{ 
                color: "rgba(255,255,255,0.5)", 
                textDecoration: "none",
                cursor: "default"  // 👈 keeps normal cursor
              }}
            >This </a>
            {"website should "}
            <a 
              href="/play?version=1.8.8" 
              style={{ 
                color: "rgba(255,255,255,0.5)", 
                textDecoration: "none",
                cursor: "default"
              }}
            >not be </a>
            {"reproduced without "}
            <a 
              href="/play?version=1.12.2" 
              style={{ 
                color: "rgba(255,255,255,0.5)", 
                textDecoration: "none",
                cursor: "default"
              }}
            >permission </a>
            {"from the owner."}
          </p>
        </div>
      </footer>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed", bottom: "22px", right: "22px",
            background: SLS_BLUE, color: "white", border: "none",
            borderRadius: "50%", width: "44px", height: "44px",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            fontSize: "8px", fontWeight: 700, gap: "1px",
            fontFamily: FONT, boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            letterSpacing: "0.5px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 10.5V2.5M2.5 6.5l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          TOP
        </button>
      )}
    </div>
  );
}
