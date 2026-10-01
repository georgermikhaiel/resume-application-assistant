const stages = [
  ["1", "Save job", "Paste an employer or ATS posting URL."],
  ["2", "Review fit", "See matching evidence, gaps, and duplicate warnings."],
  ["3", "Tailor", "Create a versioned résumé and cover-letter draft from verified facts."],
  ["4", "Apply", "Use the extension to fill the supported application form."],
];

export default function HomePage() {
  return (
    <main>
      <nav><span className="brand">Career Application Assistant</span><span className="badge">Foundation</span></nav>
      <section className="hero">
        <p className="eyebrow">FULL-STACK APPLICATION COPILOT</p>
        <h1>Prepare better applications, with a record of every decision.</h1>
        <p className="lede">The dashboard will own your jobs, verified profile facts, résumé versions, and application history. The Chrome extension remains the browser-side assistant.</p>
        <div className="actions"><button>Set up profile</button><button className="secondary">Import a job URL</button></div>
      </section>
      <section className="status-grid" aria-label="Project foundation status">
        <article><strong>Dashboard</strong><span>Next.js workspace ready</span></article>
        <article><strong>Application data</strong><span>Database schema defined</span></article>
        <article><strong>Extension</strong><span>Preserved as the browser executor</span></article>
      </section>
      <section className="workflow"><p className="eyebrow">FIRST RELEASE WORKFLOW</p><h2>One job, one tailored application, fully traceable.</h2><div className="stages">{stages.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="next"><h2>Next implementation target</h2><p>Connect this screen to profile facts and saved jobs, then expose those records to the extension through authenticated API routes.</p></section>
    </main>
  );
}
