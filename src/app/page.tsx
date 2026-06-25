const logLines = [
  ["14:32:08", "auth", "GitHub account connected", "success"],
  ["14:32:09", "repos", "found 18 public repos with 2026 activity", ""],
  ["14:32:13", "commits", "scanned 305 qualifying commits", ""],
  ["14:32:16", "leverage", "128 commits shipped with AI leverage", "success"],
  ["14:32:18", "snapshot", "AI leverage total => 128 shipped commits █", "gradient"],
];

const podium = [
  {
    className: "podiumCard podiumSecond",
    initials: "JD",
    name: "John Doe",
    handle: "@johndev",
    rank: "#2",
    score: "1.94",
    meta: "512 leverage commits",
  },
  {
    className: "podiumCard podiumFirst",
    initials: "RM",
    name: "Rey Milbourne",
    handle: "@reym",
    rank: "#1",
    score: "2.41",
    meta: "Top 1% · 1,284 commits",
  },
  {
    className: "podiumCard podiumThird",
    initials: "AM",
    name: "Augusta Mitchell",
    handle: "@augusta",
    rank: "#3",
    score: "1.72",
    meta: "391 leverage commits",
  },
];

const leaderboardRows = [
  ["12", "NB", "Naseem Brev", "@Naseem9brev", "1.27", "128 leverage commits", "305 commits", true],
  ["13", "SC", "Sam Chen", "@samcodes", "1.22", "156 leverage commits", "412 commits", false],
  ["14", "AK", "Ava Khan", "@ava-k", "1.19", "194 leverage commits", "588 commits", false],
  ["15", "ML", "Mina Lee", "@minadev", "1.16", "270 leverage commits", "930 commits", false],
];

const metrics = [
  ["Leverage commits", "684"],
  ["Commits", "1,284"],
  ["Leverage repos", "11"],
  ["Ship index", "3.11"],
];

const breakdown = [
  ["Leverage trailers", "56%", "71"],
  ["Assisted messages", "78%", "99"],
  ["Generated footers", "23%", "29"],
  ["Shipping bursts", "41%", "52"],
];

const repoSignals = [".cursor/", "CLAUDE.md", ".devin/", "copilot-instructions.md"];

export default function Home() {
  return (
    <main className="siteShell">
      <header className="topNav">
        <a className="brand mono" href="#hero" aria-label="Prompt2Ship home">
          <span className="promptGlyph">&gt;_</span>
          <span>Prompt2Ship</span>
        </a>
        <nav className="navLinks" aria-label="Primary navigation">
          <a href="#leaderboard">Leaderboard</a>
          <a href="#profile">Profile</a>
          <a href="#scoring">Leverage snapshot</a>
        </nav>
        <a className="githubButton" href="#connect">
          <span className="statusDot" aria-hidden="true" />
          Connect GitHub
        </a>
      </header>

      <section className="heroSection" id="hero">
        <div className="heroCopy">
          <div className="eyebrow mono">
            <span className="statusDot" aria-hidden="true" />
            2026 PUBLIC COMMIT SCAN
          </div>
          <h1>
            128 commits shipped with <span className="gradientText">AI leverage.</span>
          </h1>
          <p>
            Connect GitHub to frame public 2026 commits by how much AI helped you ship:
            leverage count, momentum, and a developer-native leaderboard.
          </p>
          <div className="heroActions" id="connect">
            <a className="buttonPrimary" href="#scan">
              Connect GitHub
            </a>
            <a className="buttonSecondary" href="#leaderboard">
              View leaderboard
            </a>
          </div>
          <p className="microcopy mono">Public commits only · AI leverage framing · No private repo scan in Phase 1</p>
        </div>

        <aside className="previewCard" aria-label="Scan preview">
          <div className="browserBar">
            <span className="windowLights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="mono">scan://github/2026-public-commits</span>
          </div>
          <TerminalLog lines={logLines} />
          <div className="miniScoreGrid">
            <div className="miniScoreCard">
              <span>AI LEVERAGE</span>
              <strong className="mono gradientText">128</strong>
              <small>commits shipped with AI leverage</small>
            </div>
            <div className="miniScoreCard">
              <span>PUBLIC RANK</span>
              <strong className="mono gradientText">#12</strong>
              <small>Leaderboard published</small>
            </div>
          </div>
        </aside>
      </section>

      <section className="sectionHeader" id="leaderboard">
        <div>
          <h2>Leaderboard desktop layout</h2>
          <p>Reference screenshot density, redesigned as a dark GitHub-like leverage board.</p>
        </div>
        <div className="filterCluster">
          <span className="pill pillGreen">2026 commits</span>
          <span className="pill">All users</span>
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="panel leaderboardPanel">
          <div className="panelHeader">
            <div>
              <h3>Leaderboard</h3>
              <p>All representatives · Compare</p>
            </div>
            <div className="filterCluster">
              <span className="pill">Search</span>
              <span className="pill pillGreen">This month</span>
            </div>
          </div>

          <div className="podiumGrid">
            {podium.map((user) => (
              <article className={user.className} key={user.rank}>
                <span className="rankBadge mono">{user.rank}</span>
                <div className="avatar podiumAvatar">{user.initials}</div>
                <h4>{user.name}</h4>
                <p className="handle mono">{user.handle}</p>
                <strong className="podiumScore mono">{user.score}</strong>
                <small>{user.meta}</small>
              </article>
            ))}
          </div>

          <div className="leaderboardRows">
            {leaderboardRows.map(([rank, initials, name, handle, score, ratio, commits, current]) => (
              <a className={`leaderboardRow ${current ? "currentUser" : ""}`} href="#profile" key={`${rank}-${handle}`}>
                <span className="mono rankNumber">{rank}</span>
                <span className="userCell">
                  <span className="avatar rowAvatar">{initials}</span>
                  <span>
                    <strong>{name}</strong>
                    <small className="mono">{handle}</small>
                  </span>
                </span>
                <strong className="scoreCell mono">{score}</strong>
                <span className="pill pillGreen">{ratio}</span>
                <span className="pill">{commits}</span>
                <span className="pill">View</span>
              </a>
            ))}
          </div>
        </div>

        <ScoreRail />
      </section>

      <section className="dashboardGrid profileGrid" id="profile">
        <article className="panel profilePanel">
          <div className="sectionHeader compactHeader">
            <div>
              <h2>Profile breakdown</h2>
              <p>GitHub profile meets scan report.</p>
            </div>
          </div>
          <div className="profileIdentity">
            <div className="avatar profileAvatar">NB</div>
            <div>
              <h3>Naseem Brev</h3>
              <p className="mono">@Naseem9brev · scanned 14:32 UTC · rank #12</p>
              <div className="filterCluster">
                <span className="pill pillGreen">Share snapshot</span>
                <span className="pill">Re-scan</span>
              </div>
            </div>
          </div>

          <div className="breakdownList">
            {breakdown.map(([label, width, value]) => (
              <div className="breakdownRow" key={label}>
                <span>{label}</span>
                <span className="barTrack">
                  <span className="barFill" style={{ width }} />
                </span>
                <strong className="mono">{value}</strong>
              </div>
            ))}
          </div>

          <div className="repoSignals" aria-label="Detected repo signals">
            {repoSignals.map((signal) => (
              <span className="fileChip mono" key={signal}>{signal}</span>
            ))}
          </div>
        </article>

        <article className="panel formulaPanel" id="scoring">
          <span className="label mono">LEVERAGE SNAPSHOT</span>
          <pre className="formulaBlock mono">{`ai_leverage_commits = 128
public_commits_reviewed = 305
ship_rate = 128 / 305 = 42%
snapshot = "128 commits shipped with AI leverage"`}</pre>
          <div className="swatchGrid" aria-label="Prompt2Ship palette">
            <span style={{ background: "#05070a" }} />
            <span style={{ background: "#0b0f14" }} />
            <span style={{ background: "#101720" }} />
            <span style={{ background: "#39ff88" }} />
            <span style={{ background: "#00e5ff" }} />
            <span style={{ background: "#8b5cf6" }} />
          </div>
        </article>
      </section>

      <section className="scanGrid" id="scan">
        <article className="panel scanPanel">
          <span className="label mono">SCAN PROGRESS LOG</span>
          <div className="progressTrack" aria-label="Scan progress">
            <span />
          </div>
          <TerminalLog lines={[
            ["14:32:08", "auth", "GitHub token verified", "success"],
            ["14:32:11", "graphql", "paginating contribution years", ""],
            ["14:32:13", "commits", "305 qualifying commits", ""],
            ["14:32:16", "configs", "4 repos with AI config files", ""],
            ["14:32:19", "publish", "leaderboard rank #12 █", "success"],
          ]} />
        </article>

        <article className="shareCard" aria-label="Shareable score card">
          <div>
            <div className="brand mono">
              <span className="promptGlyph">&gt;_</span>
              <span>Prompt2Ship</span>
            </div>
            <span className="label mono">AI LEVERAGE SNAPSHOT</span>
            <strong className="shareScore mono gradientText">128</strong>
            <span className="pill pillGreen">2026 public commits</span>
          </div>
          <p className="mono">128 commits shipped with AI leverage</p>
        </article>
      </section>
    </main>
  );
}

function TerminalLog({ lines }: { lines: string[][] }) {
  return (
    <div className="terminalLog mono" aria-live="polite">
      {lines.map(([time, namespace, text, variant]) => (
        <div className="terminalLine" key={`${time}-${namespace}-${text}`}>
          <span className="terminalTime">{time}</span>
          <span className="terminalNamespace">{namespace}</span>
          <span className={variant === "success" ? "terminalSuccess" : variant === "gradient" ? "gradientText" : ""}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreRail() {
  return (
    <aside className="panel scoreRail">
      <div className="railIdentity">
        <div className="avatar railAvatar">RM</div>
        <div>
          <h3>Rey Milbourne</h3>
          <p className="mono">@reym · Level 3</p>
        </div>
      </div>
      <span className="label mono">AI LEVERAGE</span>
      <strong className="bigScore mono gradientText">1,284</strong>
      <span className="pill pillGreen">commits shipped with AI leverage</span>
      <div className="metricGrid">
        {metrics.map(([label, value]) => (
          <div className="metricCard" key={label}>
            <span>{label}</span>
            <strong className="mono">{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
