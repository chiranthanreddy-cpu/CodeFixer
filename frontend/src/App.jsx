import { useState } from 'react'
import './App.css'

const languages = ['JavaScript', 'Python', 'Java', 'C', 'C++', 'TypeScript', 'HTML/CSS', 'Other']
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function App() {
  const [language, setLanguage] = useState('JavaScript')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setRequestError('')
    setResult(null)
    setCopied(false)
    if (!code.trim() || !error.trim()) {
      setRequestError('Add both your code and the error or problem before asking for a fix.')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/fix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language, code, error }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Something went wrong while fixing your code.')
      setResult(data)
    } catch (requestFailure) {
      setRequestError(requestFailure.message || 'Something went wrong while fixing your code.')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyFixedCode() {
    try {
      await navigator.clipboard.writeText(result.fixedCode)
      setCopied(true)
    } catch {
      setRequestError('Could not copy the code. Please select and copy it manually.')
    }
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="CodeFixer home"><span>&lt;/&gt;</span> CodeFixer</a>
        <p>Understand the bug. Keep the learning.</p>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">YOUR ASSIGNMENT DEBUGGING PARTNER</p>
        <h1 id="page-title">Get unstuck without losing your way.</h1>
        <p>Paste your code and the error you hit. CodeFixer explains the issue and suggests the smallest useful correction.</p>
      </section>
      <section className="workspace" aria-label="Code debugging workspace">
        <form className="debug-form" onSubmit={handleSubmit}>
          <div className="field language-field"><label htmlFor="language">Programming language</label><select id="language" value={language} onChange={(event) => setLanguage(event.target.value)} disabled={isLoading}>{languages.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="field"><label htmlFor="code">Your code</label><textarea id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder={'Paste the code that needs a fix…\n\nfunction greet(name) {\n  return "Hello " + name\n}'} spellCheck="false" disabled={isLoading} /></div>
          <div className="field"><label htmlFor="error">Error or problem</label><textarea id="error" className="problem-input" value={error} onChange={(event) => setError(event.target.value)} placeholder="Paste the error message or describe what is not working…" disabled={isLoading} /></div>
          {requestError && <p className="request-error" role="alert">{requestError}</p>}
          <button className="fix-button" type="submit" disabled={isLoading}>{isLoading ? <><span className="spinner" aria-hidden="true" />Finding the smallest fix…</> : 'Fix My Code'}</button>
        </form>
        <section className="result-panel" aria-live="polite" aria-label="Code fix result">
          {isLoading && <div className="result-state loading-state"><span className="large-spinner" /><h2>Looking at your code…</h2><p>Checking the error and preparing a focused fix.</p></div>}
          {!isLoading && !result && <div className="result-state empty-state"><div className="empty-icon">✦</div><h2>Your fix will appear here</h2><p>Start by adding your code and the error message on the left.</p></div>}
          {!isLoading && result && <div className="result-content">
            <div className="result-section"><p className="result-label">WHAT IS WRONG</p><p>{result.problem}</p></div>
            <div className="result-section code-section"><div className="code-heading"><p className="result-label">FIXED CODE</p><button type="button" className="copy-button" onClick={copyFixedCode}>{copied ? 'Copied!' : 'Copy code'}</button></div><pre><code>{result.fixedCode}</code></pre></div>
            <div className="result-section"><p className="result-label">WHY THE FIX WORKS</p><p>{result.explanation}</p></div>
          </div>}
        </section>
      </section>
      <footer>CodeFixer helps you understand a correction — always read it before submitting your work.</footer>
    </main>
  )
}

export default App
