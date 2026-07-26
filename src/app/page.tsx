import CheckerForm from '@/components/CheckerForm';

const features = [
  ['⌁', 'Simple checks', 'Paste your provider URL and get the account information you need in a clear, readable result.'],
  ['⌁', 'Secure connection', 'Every check is performed server-side with a secure connection to your IPTV provider.'],
  ['◌', 'Always free', 'No registration, subscription, or hidden charge to check your own IPTV account.'],
  ['◇', 'Privacy focused', 'Your playlist credentials are used for the live check only and are never saved.'],
  ['✦', 'Xtream compatible', 'Built for common M3U, get.php, player_api.php and live stream URL formats.'],
  ['↗', 'Live status', 'See availability, expiry, account type, and active connection limits in seconds.'],
];

const faqs = [
  ['Is my IPTV URL safe?', 'Yes. We use your URL only to request the live account response from your provider. It is not saved in a database or shown to other users.'],
  ['What kind of links can I check?', 'You can paste common Xtream Codes playlist URLs, including get.php, player_api.php, and live stream URLs with username and password details.'],
  ['Why did my check fail?', 'Your provider may be offline, the credentials may be invalid, or the pasted URL may be incomplete. Check that your link includes the correct account details.'],
];

export default function Home() {
  return <main className="landing">
    <section className="hero-area" id="top">
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#top" className="logo"><span className="logo-symbol">✦</span> iptv <b>checker</b></a>
        <div className="nav-menu"><a href="#top">Home</a><a href="#features">Features</a><a href="#apps">Apps</a><a href="#faq">FAQs</a></div>
        <a className="nav-button" href="#checker">Check now</a>
      </nav>
      <div className="hero-layout">
        <div className="hero-content">
          <p className="hero-tag">XTREAM CODES ACCOUNT TOOL</p>
          <h1>A better way to check your IPTV account.</h1>
          <p className="hero-text">Get a clear, live view of your subscription. Check account status, expiry date, and connection limits in one place.</p>
          <div className="store-actions"><a href="#checker" className="store-button filled"><span>⌁</span> Check your line</a><a href="#features" className="store-button">How it works <span>↓</span></a></div>
          <p className="hero-trust"><span>●</span> Private live checks · No account required</p>
        </div>
        <div className="hero-checker" id="checker"><CheckerForm /></div>
      </div>
    </section>

    <section className="features-section" id="features">
      <p className="section-label">FEATURES</p>
      <h2>A simpler experience,<br />built around the details.</h2>
      <p className="section-lead">Everything you need to understand your IPTV account, without the clutter.</p>
      <div className="feature-grid">{features.map(([icon, title, text]) => <article className="feature-card" key={title}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="app-section" id="apps">
      <div className="app-orbit orbit-one" /><div className="app-orbit orbit-two" />
      <p className="section-label light">AVAILABLE WHEN YOU NEED IT</p>
      <h2>Check your line.<br />Stay in control.</h2>
      <p>Built for quick, private account checks from any modern browser.</p>
      <div className="store-actions centered"><a href="#checker" className="store-button white">Check subscription <span>→</span></a></div>
    </section>

    <section className="faq-section" id="faq"><p className="section-label">FAQ</p><h2>Frequently asked questions</h2><p className="section-lead">A few helpful answers before you check your account.</p><div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span className="faq-number">0{index + 1}</span>{question}<span className="faq-control">+</span></summary><p>{answer}</p></details>)}</div></section>

    <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a href="#top" className="logo"><span className="logo-symbol">✦</span> iptv <b>checker</b></a><p>Clear IPTV account information, whenever you need it.</p><small>© {new Date().getFullYear()} IPTV Checker</small></div><FooterColumn title="Product" links={['Account checker', 'Features', 'FAQ']} /><FooterColumn title="Support" links={['Help center', 'Status', 'Contact']} /><FooterColumn title="Legal" links={['Privacy policy', 'Terms of use']} /></div><div className="footer-line"><span>Made for clear, responsible account checks.</span><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}

function FooterColumn({ title, links }: { title: string; links: string[] }) { return <div className="footer-column"><h3>{title}</h3>{links.map((link) => <a href={link === 'FAQ' ? '#faq' : '#top'} key={link}>{link}</a>)}</div>; }
