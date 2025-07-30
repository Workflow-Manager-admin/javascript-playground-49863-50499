import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

/**
 * PUBLIC_INTERFACE
 * App renders a modern two-pane JavaScript playground.
 * - Left pane: code editor (syntax highlighting).
 * - Right pane: output console (real-time JS execution).
 * - Header: Project branding, share button.
 * - Theme/colors per Kavia spec. Light/minimalist.
 */
function App() {
  // UI/logic state
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState("// Try writing some JS!\nconsole.log('Hello, JavaScript!');");
  const [consoleOut, setConsoleOut] = useState("");
  const [errorInfo, setErrorInfo] = useState("");
  const [shareUrl, setShareUrl] = useState(null);
  const editorRef = useRef();

  // Set CSS theme variable
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Re-highlight code as you type for syntax highlight
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  // Execute code on change
  useEffect(() => {
    // Debounced evaluation
    const timeout = setTimeout(() => {
      executeUserCode();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [code]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  // PUBLIC_INTERFACE
  function onEditorInput(e) {
    setCode(e.target.value);
  }

  // PUBLIC_INTERFACE
  function executeUserCode() {
    // Capture console.log output
    let output = "";
    let err = "";

    // Custom logger
    const fakeConsole = {
      log: (...args) => {
        output += args.join(" ") + "\n";
      },
    };

    // Run in sandboxed function
    try {
      setErrorInfo(""); // reset error
      // eslint-disable-next-line no-new-func
      new Function("console", code)(fakeConsole);
    } catch (e) {
      err = e.message;
    }

    // Update output state
    setConsoleOut(output);
    setErrorInfo(err);
  }

  // PUBLIC_INTERFACE
  function handleShare() {
    // Generate "share link" using window.location (encode code in URL hash or use clipboard)
    const loc = window.location.origin + window.location.pathname;
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const share = `${loc}?snippet=${encoded}`;
    setShareUrl(share);
    // Copy to clipboard
    navigator.clipboard.writeText(share).catch(() => {});
  }

  // On load, check for shared snippet in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snippet = params.get("snippet");
    if (snippet) {
      try {
        setCode(decodeURIComponent(escape(atob(snippet))));
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="playground-root">
      {/* Header Bar */}
      <header className="playground-header">
        <div className="brand-title">
          <span className="brand-dot"></span> JS Playground
        </div>
        <button className="share-btn" onClick={handleShare} title="Copy shareable code link">
          Share
        </button>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {/* Show share toast */}
        {shareUrl && (
          <div className="share-toast">
            Link copied!
            <span className="share-toast-url">{shareUrl}</span>
          </div>
        )}
      </header>
      {/* Main Two-Pane Body */}
      <main className="playground-main">
        {/* LEFT: Code Editor */}
        <section className="editor-pane">
          <div className="editor-label">Editor</div>
          <div className="code-editor-container">
            <textarea
              ref={editorRef}
              value={code}
              onChange={onEditorInput}
              spellCheck={false}
              autoCorrect="off"
              autoComplete="off"
              className="code-textarea"
              aria-label="JavaScript code editor"
              tabIndex={1}
            />
            {/* Prism.js Highlighted code; shown for style/background only */}
            <pre className="editor-prism-pre">
              <code className="language-javascript">{code}</code>
            </pre>
          </div>
        </section>
        {/* RIGHT: Output */}
        <section className="output-pane">
          <div className="output-label">Console Output</div>
          <div className="console-box" tabIndex={2}>
            <pre className="console-output">{consoleOut || <span className="console-muted">// Output will appear here</span>}</pre>
            {errorInfo && (
              <pre className="console-error">Error: {errorInfo}</pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
