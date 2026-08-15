import type { Env } from '../types';
import { SITE_ART } from './assets';
import { htmlEscape, siteLinks } from './urls';

const DESCRIPTION =
	'Patch brings Critical Ops player profiles, ranked stats, comparisons, tracking, and community tools directly into Discord.';

export function homepageHtml(request: Request, env: Env): string {
	const links = siteLinks(request, env);
	const canonical = new URL('/', links.canonical).toString();
	const socialImage = new URL(SITE_ART.hero, canonical).toString();
	const addPatch = htmlEscape(links.addPatch);
	const support = htmlEscape(links.support);
	const docs = htmlEscape(links.docs);

	return `<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <meta name='description' content='${htmlEscape(DESCRIPTION)}'>
  <meta name='theme-color' content='#75d3e4'>
  <meta property='og:type' content='website'>
  <meta property='og:title' content='Patch — Critical Ops player tools for Discord'>
  <meta property='og:description' content='${htmlEscape(DESCRIPTION)}'>
  <meta property='og:url' content='${htmlEscape(canonical)}'>
  <meta property='og:image' content='${htmlEscape(socialImage)}'>
  <meta name='twitter:card' content='summary_large_image'>
  <title>Patch — Critical Ops player tools for Discord</title>
  <link rel='canonical' href='${htmlEscape(canonical)}'>
  <link rel='icon' href='/favicon.png' type='image/png'>
  <link rel='preload' href='${SITE_ART.hero}' as='image' type='image/jpeg' fetchpriority='high'>
  <link rel='stylesheet' href='/patch.css?v=2'>
  <script src='/patch.js?v=2' defer></script>
</head>
<body>
  <a class='skip-link' href='#main'>Skip to content</a>
  <div class='site-shell'>
    <header class='site-header' aria-label='Primary navigation'>
      <div class='header-inner'>
        <a class='brand' href='#top' aria-label='Patch home'>patch <span class='brand-note'>for Critical Ops</span></a>
        <button class='nav-toggle' type='button' aria-controls='primary-nav' aria-expanded='false' aria-label='Open navigation'>☰</button>
        <nav class='nav' id='primary-nav' aria-label='Sections'>
          <a href='#features'>Features</a>
          <a href='#commands'>Commands</a>
          <a href='#trust'>Community</a>
        </nav>
        <div class='header-actions'>
          <button class='icon-button theme-toggle' type='button' aria-label='Switch theme'>
            <span class='theme-icon theme-moon' aria-hidden='true'>◐</span>
            <span class='theme-icon theme-sun' aria-hidden='true'>☀</span>
          </button>
          <a class='install-chip' href='${addPatch}'><span aria-hidden='true'>＋</span> Add Patch</a>
        </div>
      </div>
    </header>

    <main id='main'>
      <section class='hero' id='top' aria-labelledby='hero-title'>
        <div class='hero-art' aria-hidden='true'>
          <span class='hero-ribbon ribbon-glow'></span>
          <span class='hero-ribbon ribbon-blue'></span>
          <span class='hero-ribbon ribbon-main'></span>
          <span class='hero-ribbon ribbon-bottom'></span>
        </div>
        <div class='hero-inner'>
          <div class='hero-copy'>
            <p class='eyebrow'>Critical Ops × Discord</p>
            <h1 id='hero-title'>
              <span>Player</span>
              <span>context</span>
              <span>without</span>
              <span>leaving</span>
              <span>Discord</span>
            </h1>
            <p class='hero-lead'>Look up profiles, compare ranked performance, follow progress, and give your community clearer information with one focused Discord bot.</p>
            <div class='hero-buttons' aria-label='Primary actions'>
              <a class='button button-primary' href='${addPatch}'><span aria-hidden='true'>＋</span> Add Patch</a>
              <a class='button button-secondary' href='#commands'><span aria-hidden='true'>›</span> See commands</a>
            </div>
          </div>

          <div class='hero-preview' aria-label='Example Patch player profile response'>
            <div class='preview-window'>
              <div class='preview-topbar' aria-hidden='true'>
                <span class='window-dot'></span><span class='window-dot'></span><span class='window-dot'></span>
                <span class='preview-label'>Patch / profile</span>
              </div>
              <article class='profile-preview'>
                <div class='profile-heading'>
                  <div class='profile-avatar' aria-hidden='true'>P</div>
                  <div><small>Example player</small><strong>Critical Operator</strong></div>
                  <span class='secure-pill'>Public data</span>
                </div>
                <div class='profile-rank'>
                  <img src='${SITE_ART.master}' alt='Master rank badge'>
                  <div class='rank-name'>Master<small>Peak: Spec Ops · Season view</small></div>
                  <div class='rank-mmr'>1661<small>MMR</small></div>
                </div>
                <div class='profile-metrics'>
                  <div><small>K/D</small><strong>2.00</strong></div>
                  <div><small>Win rate</small><strong>66%</strong></div>
                  <div><small>Level</small><strong>88</strong></div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class='proof-band' aria-label='Patch facts'>
        <div class='proof-inner'>
			<article class='proof-item'><span class='proof-icon'>/6</span><div><span>Core toolkit</span><strong>Six community commands</strong></div></article>
          <article class='proof-item'><span class='proof-icon'>25</span><div><span>Personal dashboard</span><strong>Track up to 25 players</strong></div></article>
          <article class='proof-item'><span class='proof-icon'>↗</span><div><span>Install anywhere</span><strong>User and server installs</strong></div></article>
          <a class='release-pill' href='#commands'>Profiles, stats, tracking, and reports</a>
        </div>
      </section>

      <div id='features'>
        <section class='feature-section reveal' aria-labelledby='lookup-title'>
          <div class='feature-copy'>
            <p class='section-kicker'>01 · Look up</p>
            <h2 id='lookup-title'>Know the player behind the name.</h2>
            <p>Turn a player name or ID into a readable profile card with rank, MMR, K/D, win rate, level, season context, and community status.</p>
            <div class='tag-list' aria-label='Profile features'>
              <span>Profile cards</span><span>Rank and MMR</span><span>Season stats</span><span>Player IDs</span>
            </div>
          </div>
          <div class='feature-visual' aria-label='Player lookup preview'>
            <div class='visual-grid' aria-hidden='true'></div>
            <article class='lookup-card'>
              <div class='lookup-banner'></div>
              <div class='lookup-content'>
                <div class='lookup-row'><span>Current rank</span><strong>Master</strong></div>
                <div class='lookup-row'><span>Peak rank</span><strong>Spec Ops</strong></div>
                <div class='lookup-row'><span>Current season</span><strong>2.00 K/D · 66% wins</strong></div>
                <div class='lookup-row'><span>Last online</span><strong>Activity context</strong></div>
              </div>
            </article>
          </div>
        </section>

        <section class='feature-section reverse reveal' aria-labelledby='compare-title'>
          <div class='feature-copy'>
            <p class='section-kicker'>02 · Compare</p>
            <h2 id='compare-title'>Put two profiles side by side.</h2>
            <p>Compare current-season rank, MMR, K/D, KDA, win rate, kills per match, and recent activity without juggling screenshots or websites.</p>
            <div class='tag-list' aria-label='Comparison features'>
              <span>Current season</span><span>Clear advantages</span><span>Activity context</span><span>Private replies</span>
            </div>
          </div>
          <div class='feature-visual' aria-label='Player comparison preview'>
            <div class='visual-grid' aria-hidden='true'></div>
            <div class='compare-board'>
              <article class='compare-player'>
                <img src='${SITE_ART.master}' alt='Master rank badge'><h3>Player One</h3><p>Master · 1661 MMR</p>
                <div class='compare-stat'><span>K/D</span><strong>2.00</strong></div><div class='compare-stat'><span>Win rate</span><strong>66%</strong></div>
              </article>
              <span class='versus' aria-hidden='true'>VS</span>
              <article class='compare-player'>
                <img src='${SITE_ART.specops}' alt='Spec Ops rank badge'><h3>Player Two</h3><p>Spec Ops · 1750 MMR</p>
                <div class='compare-stat'><span>K/D</span><strong>1.83</strong></div><div class='compare-stat'><span>Win rate</span><strong>71%</strong></div>
              </article>
            </div>
          </div>
        </section>

        <section class='feature-section reveal' aria-labelledby='track-title'>
          <div class='feature-copy'>
            <p class='section-kicker'>03 · Track</p>
            <h2 id='track-title'>See what changed since last time.</h2>
            <p>Build a personal tracking list and follow MMR, rank, kills, deaths, level, and activity. Patch compares the latest snapshot with your saved baseline.</p>
            <div class='tag-list' aria-label='Tracking features'>
              <span>Rank movement</span><span>Saved baselines</span><span>25 players</span><span>Private dashboard</span>
            </div>
          </div>
          <div class='feature-visual' aria-label='Rank tracking preview'>
            <div class='visual-grid' aria-hidden='true'></div>
            <div class='track-board'>
              <div class='track-head'><div><h3>Ranked movement</h3><p>Since your last check</p></div><span class='movement'>+89 MMR</span></div>
              <div class='rank-path'><span class='rank-line' aria-hidden='true'></span><div class='rank-icons'><img src='${SITE_ART.diamond}' alt='Diamond rank badge'><img src='${SITE_ART.master}' alt='Master rank badge'><img src='${SITE_ART.specops}' alt='Spec Ops rank badge'></div></div>
            </div>
          </div>
        </section>
      </div>

      <div class='commands-wrap' id='commands'>
        <section class='commands-section reveal' aria-labelledby='commands-title'>
          <div class='section-heading'>
            <p class='section-kicker'>Discord-native tools</p>
            <h2 id='commands-title'>Start with a slash command.</h2>
            <p>Patch stays inside the place your squad already talks. Choose a command to see where it fits.</p>
          </div>
          <div class='command-explorer'>
            <div class='command-tabs' role='tablist' aria-label='Patch commands'>
              <button class='command-tab' id='tab-profile' type='button' role='tab' aria-selected='true' aria-controls='panel-profile' data-command='profile'>/profile</button>
              <button class='command-tab' id='tab-stats' type='button' role='tab' aria-selected='false' aria-controls='panel-stats' data-command='stats'>/stats</button>
              <button class='command-tab' id='tab-compare' type='button' role='tab' aria-selected='false' aria-controls='panel-compare' data-command='compare'>/compare</button>
              <button class='command-tab' id='tab-track' type='button' role='tab' aria-selected='false' aria-controls='panel-track' data-command='track'>/track</button>
              <button class='command-tab' id='tab-report' type='button' role='tab' aria-selected='false' aria-controls='panel-report' data-command='report'>/report</button>
              <button class='command-tab' id='tab-help' type='button' role='tab' aria-selected='false' aria-controls='panel-help' data-command='help'>/help</button>
            </div>
            <div class='command-panels'>
              <article class='command-panel' id='panel-profile' role='tabpanel' aria-labelledby='tab-profile' data-command-panel='profile'>
                <span class='command-label'>/profile player:&lt;name-or-id&gt;</span><h3>A shareable player card.</h3><p>Get the visual overview: identity, rank, core performance, level, and available community context.</p><div class='discord-message'><strong>Patch</strong> generated a player profile card.<small>Refresh it, open detailed stats, compare, track, or start a report from the controls.</small></div>
              </article>
              <article class='command-panel' id='panel-stats' role='tabpanel' aria-labelledby='tab-stats' data-command-panel='stats' hidden>
                <span class='command-label'>/stats player:&lt;name-or-id&gt;</span><h3>Go deeper than the card.</h3><p>Browse overview, current season, and all-time information in an interactive Discord dashboard.</p><div class='discord-message'><strong>Patch</strong> found the public profile.<small>Switch views without running another command.</small></div>
              </article>
              <article class='command-panel' id='panel-compare' role='tabpanel' aria-labelledby='tab-compare' data-command-panel='compare' hidden>
                <span class='command-label'>/compare player_1:… player_2:…</span><h3>Make the matchup readable.</h3><p>See the current-season edge across the statistics players actually discuss.</p><div class='discord-message'><strong>Patch</strong> built a current-season comparison.<small>Use a private reply when the result is just for you.</small></div>
              </article>
              <article class='command-panel' id='panel-track' role='tabpanel' aria-labelledby='tab-track' data-command-panel='track' hidden>
                <span class='command-label'>/track player:&lt;optional&gt;</span><h3>Your progress watchlist.</h3><p>Add players, refresh snapshots, review movement, and accept the latest values as the new baseline.</p><div class='discord-message'><strong>Patch</strong> refreshed your tracking dashboard.<small>Tracking replies are private by default.</small></div>
              </article>
              <article class='command-panel' id='panel-report' role='tabpanel' aria-labelledby='tab-report' data-command-panel='report' hidden>
                <span class='command-label'>/report player:… proof:…</span><h3>Send context, not rumors.</h3><p>Configured communities can collect proof-backed reports in a private staff-review workflow.</p><div class='discord-message'><strong>Patch</strong> received the report privately.<small>A configured staff channel is required; Patch does not automatically label someone a cheater.</small></div>
              </article>
              <article class='command-panel' id='panel-help' role='tabpanel' aria-labelledby='tab-help' data-command-panel='help' hidden>
                <span class='command-label'>/help</span><h3>Find the right tool quickly.</h3><p>Open the interactive command guide and move directly to profiles, stats, comparisons, tracking, or support.</p><div class='discord-message'><strong>Patch</strong> opened the help dashboard.<small>Most tools can be installed to your own Discord account.</small></div>
              </article>
            </div>
          </div>
        </section>
      </div>

      <section class='more-section reveal' aria-labelledby='more-title'>
        <div class='section-heading'>
          <p class='section-kicker'>More of Patch</p>
          <h2 id='more-title'>Small details that make it useful.</h2>
          <p>The bot is built around real player questions, quick Discord interactions, and public Critical Ops profile data.</p>
        </div>
        <div class='feature-grid'>
          <article class='mini-feature'><span class='mini-icon'>ID</span><h3>Name or player ID</h3><p>Resolve profiles using the identifier you already have.</p></article>
          <article class='mini-feature'><span class='mini-icon'>S17</span><h3>Season context</h3><p>Separate current ranked performance from longer-term totals.</p></article>
          <article class='mini-feature'><span class='mini-icon'>PNG</span><h3>Rendered profile cards</h3><p>Share a polished card instead of an unreadable data dump.</p></article>
          <article class='mini-feature'><span class='mini-icon'>↔</span><h3>Interactive controls</h3><p>Move between related views from the same Discord response.</p></article>
          <article class='mini-feature'><span class='mini-icon'>◉</span><h3>Private replies</h3><p>Keep personal lookups and tracking dashboards out of chat when preferred.</p></article>
          <article class='mini-feature'><span class='mini-icon'>TAG</span><h3>Community tags</h3><p>Allow-listed maintainers can add curated public context.</p></article>
          <article class='mini-feature'><span class='mini-icon'>DM</span><h3>Helpful follow-ups</h3><p>Onboarding and configured report outcomes can arrive privately.</p></article>
          <article class='mini-feature'><span class='mini-icon'>CF</span><h3>Always-on Worker</h3><p>One Cloudflare Worker serves the bot endpoint, jobs, and this site.</p></article>
        </div>
      </section>

      <div class='trust-wrap' id='trust'>
        <section class='trust-section reveal' aria-labelledby='trust-title'>
          <div class='trust-copy'>
            <p class='section-kicker'>Community context</p>
            <h2 id='trust-title'>Structured reports, human decisions.</h2>
            <p>Patch is not anti-cheat and does not replace official moderation. Its optional reporting flow helps configured communities collect evidence, keep review private, record a decision, and notify the reporter.</p>
            <div class='hero-buttons'><a class='button button-primary' href='${support}'>Join Patch support</a></div>
          </div>
          <div class='review-flow' aria-label='Community report workflow'>
            <div class='flow-row'><span class='flow-number'>01</span><strong>Evidence submitted</strong><span>Private</span></div>
            <div class='flow-row'><span class='flow-number'>02</span><strong>Staff review</strong><span>Human</span></div>
            <div class='flow-row'><span class='flow-number'>03</span><strong>Outcome recorded</strong><span>Auditable</span></div>
            <div class='flow-row'><span class='flow-number'>04</span><strong>Reporter updated</strong><span>Direct</span></div>
          </div>
        </section>
      </div>

      <section class='closing reveal' aria-labelledby='closing-title'>
        <div class='closing-card'>
          <div class='closing-content'>
            <h2 id='closing-title'>Bring clearer player context to your Discord.</h2>
            <p>Add Patch, run a profile lookup, and move from player name to useful Critical Ops context in seconds.</p>
            <div class='cta-actions'>
              <a class='button button-primary' href='${addPatch}'>＋ Add Patch to Discord</a>
              <a class='button button-secondary' href='${support}'>Join Patch support</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class='site-footer'>
      <div class='footer-inner'>
        <div class='footer-brand'><strong>patch</strong><p>Community-built Critical Ops player tools, available where players already talk.</p></div>
        <div class='footer-group'><strong>Explore</strong><a href='#features'>Features</a><a href='#commands'>Commands</a><a href='#trust'>Community reports</a></div>
        <div class='footer-group'><strong>Get Patch</strong><a href='${addPatch}'>Add to Discord</a><a href='${support}'>Support server</a></div>
        <div class='footer-group'><strong>Project</strong><a href='${docs}'>Source &amp; docs</a><a href='/robots.txt'>Robots</a></div>
      </div>
      <div class='footer-bottom'><span>© <span data-current-year>2026</span> Patch.</span><span>Community project; not affiliated with Critical Force. Critical Ops artwork is used for game context.</span></div>
    </footer>
  </div>
</body>
</html>`;
}

export function notFoundHtml(): string {
	return `<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><meta name='robots' content='noindex'><title>Page not found — Patch</title><link rel='stylesheet' href='/patch.css?v=2'></head><body><main class='not-found'><article><h1>404</h1><p>That Patch page does not exist.</p><a class='button button-primary' href='/'>Back to Patch</a></article></main></body></html>`;
}

export function sitemapXml(request: Request, env: Env): string {
	const canonical = new URL('/', siteLinks(request, env).canonical).toString();
	return `<?xml version='1.0' encoding='UTF-8'?>\n<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'><url><loc>${htmlEscape(canonical)}</loc></url></urlset>`;
}
