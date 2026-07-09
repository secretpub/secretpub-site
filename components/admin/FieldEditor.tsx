"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";

export type SetAt = (path: (string | number)[], value: unknown) => void;

/* eslint-disable @typescript-eslint/no-explicit-any */

function isPlainObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function isImageKey(k: string) {
  return /^(src|image|img|imgsrc|shotsrc|ogimage|logo|photo)$/i.test(k);
}
function looksLikeImage(v: string) {
  return (
    /^\/assets\//.test(v) ||
    /^https?:\/\/.+\.(png|jpe?g|webp|avif|svg)(\?|$)/i.test(v) ||
    /\.(png|jpe?g|webp|avif)$/i.test(v)
  );
}
function isHtmlKey(k: string) {
  return /html$/i.test(k);
}
function labelize(k: string | number): string {
  return String(k)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
function blankLike(v: unknown): unknown {
  if (Array.isArray(v)) return [];
  if (isPlainObject(v)) {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v)) o[k] = blankLike(v[k]);
    return o;
  }
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  return "";
}

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const { url } = await uploadImage(fd);
      onChange(url);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Échec de l'envoi");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  return (
    <div className="fe-img">
      <div className="fe-thumb">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        ) : (
          "vide"
        )}
      </div>
      <div className="fe-img-ctl">
        <input
          className="fe-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/… ou URL"
        />
        <div>
          <button
            type="button"
            className="adm-btn sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Envoi…" : "Téléverser une image"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFile}
          />
        </div>
        {err && <div className="adm-status err">{err}</div>}
      </div>
    </div>
  );
}

function ScalarField({
  k,
  value,
  path,
  setAt,
  hideLabel,
}: {
  k: string | number;
  value: unknown;
  path: (string | number)[];
  setAt: SetAt;
  hideLabel?: boolean;
}) {
  const key = String(k);
  if (typeof value === "boolean") {
    return (
      <label className="fe-check">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => setAt(path, e.target.checked)}
        />
        {labelize(key)}
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="fe-row">
        {!hideLabel && <label className="fe-label">{labelize(key)}</label>}
        <input
          className="fe-input"
          type="number"
          value={value}
          onChange={(e) => setAt(path, Number(e.target.value))}
        />
      </div>
    );
  }
  const str = value == null ? "" : String(value);
  const isImg = isImageKey(key) || looksLikeImage(str);
  const isHtml = isHtmlKey(key);
  const isLong = str.length > 70 || str.includes("\n") || isHtml;
  return (
    <div className="fe-row">
      {!hideLabel && (
        <label className="fe-label">
          {labelize(key)}
          {isHtml ? " (HTML)" : ""}
        </label>
      )}
      {isImg ? (
        <ImageField value={str} onChange={(v) => setAt(path, v)} />
      ) : isLong ? (
        <textarea
          className={"fe-textarea" + (isHtml ? " mono" : "")}
          value={str}
          onChange={(e) => setAt(path, e.target.value)}
        />
      ) : (
        <input
          className="fe-input"
          type="text"
          value={str}
          onChange={(e) => setAt(path, e.target.value)}
        />
      )}
    </div>
  );
}

function ObjectEditor({
  k,
  value,
  path,
  setAt,
  top,
}: {
  k: string | number;
  value: Record<string, any>;
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  const keys = Object.keys(value);
  const body = (
    <div className={top ? undefined : "fe-body"}>
      {keys.map((ck) => (
        <FieldEditor
          key={ck}
          k={ck}
          value={value[ck]}
          path={[...path, ck]}
          setAt={setAt}
        />
      ))}
    </div>
  );
  if (top) return body;
  return (
    <details className="fe-group" open>
      <summary>
        {labelize(k)}
        <span className="fe-count">{keys.length} champs</span>
      </summary>
      {body}
    </details>
  );
}

function ArrayEditor({
  k,
  value,
  path,
  setAt,
  top,
}: {
  k: string | number;
  value: any[];
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  const arr = value;
  const scalar = arr.length > 0 && !isPlainObject(arr[0]) && !Array.isArray(arr[0]);
  const set = (a: unknown[]) => setAt(path, a);
  const add = () => set([...arr, arr.length ? blankLike(arr[arr.length - 1]) : ""]);
  const removeAt = (i: number) => set(arr.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    const c = arr.slice();
    [c[i], c[j]] = [c[j], c[i]];
    set(c);
  };
  const inner = (
    <div className="fe-array">
      {arr.map((item, i) =>
        scalar ? (
          <div
            key={i}
            style={{ display: "flex", gap: 6, alignItems: "center", margin: "6px 0" }}
          >
            <div style={{ flex: 1 }}>
              <ScalarField k={i} value={item} path={[...path, i]} setAt={setAt} hideLabel />
            </div>
            <button className="adm-btn sm ghost" type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button className="adm-btn sm ghost" type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1}>↓</button>
            <button className="adm-btn sm danger" type="button" onClick={() => removeAt(i)}>✕</button>
          </div>
        ) : (
          <div className="fe-item" key={i}>
            <div className="fe-item-head">
              <span className="fe-item-t">
                {labelize(k)} #{i + 1}
              </span>
              <span className="sp" style={{ marginLeft: "auto" }} />
              <button className="adm-btn sm ghost" type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="adm-btn sm ghost" type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1}>↓</button>
              <button className="adm-btn sm danger" type="button" onClick={() => removeAt(i)}>Supprimer</button>
            </div>
            <div className="fe-item-body">
              {isPlainObject(item) ? (
                Object.keys(item).map((ck) => (
                  <FieldEditor key={ck} k={ck} value={item[ck]} path={[...path, i, ck]} setAt={setAt} />
                ))
              ) : (
                <ScalarField k={i} value={item} path={[...path, i]} setAt={setAt} hideLabel />
              )}
            </div>
          </div>
        ),
      )}
      <button className="adm-btn sm" type="button" onClick={add}>
        + Ajouter
      </button>
    </div>
  );
  if (top) return inner;
  return (
    <details className="fe-group" open>
      <summary>
        {labelize(k)}
        <span className="fe-count">{arr.length} éléments</span>
      </summary>
      <div className="fe-body">{inner}</div>
    </details>
  );
}

export function FieldEditor({
  k,
  value,
  path,
  setAt,
  top,
}: {
  k: string | number;
  value: unknown;
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  if (Array.isArray(value))
    return <ArrayEditor k={k} value={value} path={path} setAt={setAt} top={top} />;
  if (isPlainObject(value))
    return <ObjectEditor k={k} value={value} path={path} setAt={setAt} top={top} />;
  return <ScalarField k={k} value={value} path={path} setAt={setAt} />;
}
