import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>ORIGO</h1>
        <p>Google App Script-like scheduled execution platform</p>
      </div>
      <div className="card">
        <h2>Welcome to ORIGO</h2>
        <p>
          Create projects, write TypeScript/JavaScript code, and schedule your functions
          to run automatically.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link href="/login">
            <button className="button">Login</button>
          </Link>
          <Link href="/register">
            <button className="button button-secondary">Register</button>
          </Link>
        </div>
      </div>
      <div className="card">
        <h2>Features</h2>
        <ul style={{ marginLeft: '20px' }}>
          <li>Create multiple projects per account</li>
          <li>Write and save TypeScript/JavaScript code</li>
          <li>Execute specific functions on demand</li>
          <li>Schedule automatic execution with cron expressions</li>
          <li>Configure environment variables and localStorage</li>
          <li>View execution history and logs</li>
        </ul>
      </div>
    </div>
  )
}
