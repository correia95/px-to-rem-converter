import { useEffect, useMemo, useState } from 'react';
import { COMMON_PX, Unit, UNITS, convert, fmt } from './convert.ts';

function read() {
  const d = { value: '24', from: 'px' as Unit, root: '16', local: '16', adv: false };
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get('v') != null) d.value = p.get('v') || '';
    const f = p.get('u');
    if (f && UNITS.some((u) => u.id === f)) d.from = f as Unit;
    if (p.get('b')) d.root = p.get('b') as string;
    if (p.get('e')) {
      d.local = p.get('e') as string;
      d.adv = true;
    } else {
      d.local = p.get('b') || '16';
    }
  } catch {
    /* ignore */
  }
  return d;
}

const clean = (s: string) => s.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

export default function App() {
  const init = read();
  const [value, setValue] = useState(init.value);
  const [from, setFrom] = useState<Unit>(init.from);
  const [root, setRoot] = useState(init.root);
  const [adv, setAdv] = useState(init.adv);
  const [local, setLocal] = useState(init.local);
  const [copied, setCopied] = useState<string | null>(null);

  const rootN = Number(root);
  const localN = adv ? Number(local) : rootN;

  const result = useMemo(
    () => convert(Number(value), from, rootN, localN),
    [value, from, rootN, localN],
  );

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const q = u.searchParams;
      q.set('v', value);
      q.set('u', from);
      q.set('b', root);
      if (adv) q.set('e', local);
      else q.delete('e');
      window.history.replaceState(null, '', u.toString());
    } catch {
      /* ignore */
    }
  }, [value, from, root, adv, local]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
    } catch {
      /* ignore */
    }
  };

  const emShown = adv && localN !== rootN;

  return (
    <div className="app">
      <header>
        <h1>PX to REM Converter</h1>
        <p className="tag">
          Convert between <b>px</b>, <b>rem</b>, <b>em</b>, <b>pt</b> and <b>%</b> for CSS. Set your
          base (root) font size — the browser default is 16px — and enter a value in any unit.
        </p>
      </header>

      <div className="inrow">
        <label className="f grow">
          <span>Value</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(clean(e.target.value))}
            autoFocus
          />
        </label>
        <label className="f">
          <span>Unit</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as Unit)}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.symbol} — {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="inrow">
        <label className="f">
          <span>Base font size (px)</span>
          <input
            type="text"
            inputMode="decimal"
            value={root}
            onChange={(e) => setRoot(clean(e.target.value))}
          />
        </label>
        <label className="chk">
          <input type="checkbox" checked={adv} onChange={(e) => setAdv(e.target.checked)} />
          different parent size for <code>em</code> / <code>%</code>
        </label>
      </div>

      {adv && (
        <label className="f">
          <span>Parent font size for em / % (px)</span>
          <input
            type="text"
            inputMode="decimal"
            value={local}
            onChange={(e) => setLocal(clean(e.target.value))}
          />
        </label>
      )}

      {result ? (
        <div className="result">
          {UNITS.map((u) => {
            const n = result.values[u.id];
            const text = `${fmt(n)}${u.symbol === '%' ? '%' : u.symbol}`;
            const dim = (u.id === 'em' || u.id === 'percent') && !emShown && from !== u.id;
            return (
              <button
                key={u.id}
                className={`cell${dim ? ' dim' : ''}`}
                onClick={() => copy(fmt(n), u.id)}
                title="Copy value"
              >
                <span className="u">{u.symbol}</span>
                <strong>{fmt(n)}</strong>
                <em>{copied === u.id ? 'copied' : text}</em>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="hint">Enter a value and a base font size above 0.</p>
      )}

      {result && (
        <p className="sub">
          {fmt(result.px)}px at a {fmt(rootN)}px base ={' '}
          <b>
            {fmt(result.values.rem)}rem
          </b>
          . Tip: keep the base at 16px and users who change their browser font size still get scaled
          layouts if you size in rem.
        </p>
      )}

      <section className="tableblock">
        <h2>px → rem reference ({fmt(rootN || 16)}px base)</h2>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>px</th>
                <th>rem</th>
                <th>pt</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_PX.map((px) => {
                const b = rootN > 0 ? rootN : 16;
                return (
                  <tr key={px}>
                    <td>{px}px</td>
                    <td>{fmt(px / b)}rem</td>
                    <td>{fmt((px * 72) / 96)}pt</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="explainer">
        <h2>px, rem and em</h2>
        <p>
          <b>px</b> is an absolute CSS pixel. <b>rem</b> ("root em") is a multiple of the{' '}
          <code>font-size</code> set on the <code>&lt;html&gt;</code> element — 1rem is 16px by
          default. <b>em</b> is a multiple of the font size on the current element's parent, so its
          pixel value depends on where it sits. <b>pt</b> is mostly used in print stylesheets: 1pt =
          1/72 inch = 1.333px.
        </p>
        <h3>Why size in rem?</h3>
        <p>
          A reader who sets a larger default font size in their browser scales every rem-based size
          with it, including spacing and media queries. Pixel values ignore that preference. Sizing
          type and layout in rem is an accessibility win with almost no downside.
        </p>
        <h3>Should I change the root font size?</h3>
        <p>
          A common trick is <code>html {'{'} font-size: 62.5% {'}'}</code> so 1rem = 10px and the
          maths is easier. It works, but it also shrinks the effective size of anything a library
          sets in rem. Leaving the base at 16px and using this converter is safer.
        </p>
        <h3>Is anything sent to a server?</h3>
        <p>No. It is arithmetic in your browser, with the inputs kept only in the page link.</p>
        <footer>PX to REM Converter · no sign-up · works offline once loaded</footer>
      </section>
    </div>
  );
}
