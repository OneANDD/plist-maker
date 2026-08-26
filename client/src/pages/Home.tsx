/**
 * Manifest Workshop style: warm editorial tooling, asymmetric workbench layout,
 * Manifest Cobalt (#2457E6), cobalt step markers, red binding thread, and a tactile code-paper output.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clipboard,
  Download,
  FileCode2,
  FileImage,
  Info,
  Link2,
  LoaderCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  buildManifest,
  escapeXml,
  isHttpsUrl,
  isImageUrl,
  isIpaUrl,
  normalizedManifestName,
  type ManifestFields,
} from "@/lib/manifest";

const sample = {
  ipaUrl: "https://github.com/OneANDD/Hi/releases/download/Hi/signed_T7k6v3qRLWiY.ipa",
  iconUrl: "https://github.com/OneANDD/Hi/releases/download/Hi/e34434c2-944e-478a-8e3b-79ee2baedb59.png",
  bundleIdentifier: "Hi.ham",
  bundleVersion: "5.0.2",
  appName: "Test",
  manifestName: "test",
  manifestUrl: "https://example.com/test.plist",
};

const blankTemplate: ManifestFields = {
  ipaUrl: "",
  iconUrl: "",
  bundleIdentifier: "",
  bundleVersion: "",
  appName: "",
  manifestName: "manifest",
  manifestUrl: "",
};

type PublishedManifest = {
  manifestFilename: string;
  manifestUrl: string;
  installUrl: string;
};

const hostingOrigin = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const hostedAsset = (path: string) => `${hostingOrigin}${path}`;

function CodeLine({ line, number }: { line: string; number: number }) {
  const colored = escapeXml(line)
    .replace(/(&lt;!DOCTYPE.*?&gt;)/g, '<span class="xml-doctype">$1</span>')
    .replace(/(&lt;\/?[^&]+?&gt;)/g, '<span class="xml-tag">$1</span>');
  return (
    <div className="code-line">
      <span className="line-number">{String(number).padStart(2, "0")}</span>
      <span className="line-content" dangerouslySetInnerHTML={{ __html: colored }} />
    </div>
  );
}

export default function Home() {
  const [fields, setFields] = useState<ManifestFields>(blankTemplate);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFileName, setIconFileName] = useState("");
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const [copied, setCopied] = useState<"manifest" | "install" | null>(null);
  const [publishedManifest, setPublishedManifest] = useState<PublishedManifest | null>(null);
  const uploadIconMutation = trpc.manifest.uploadIcon.useMutation({
    onSuccess: (result) => {
      setPublishedManifest(null);
      setFields((current) => ({ ...current, iconUrl: result.iconUrl }));
      setIconPreview(result.iconUrl);
      setIconFileName(result.filename);
      toast.success("Icon uploaded", { description: "The public HTTPS icon URL has been added to your manifest." });
    },
    onError: (error) => toast.error("Icon upload failed", { description: error.message }),
  });
  const publishMutation = trpc.manifest.publish.useMutation({
    onSuccess: (result) => {
      setPublishedManifest(result);
      toast.success("Manifest published and ready", { description: "Copy the installation link, paste it into Safari on your Apple device, then continue to install." });
    },
    onError: (error) => toast.error("The manifest could not be published", { description: error.message }),
  });

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);

  const checks = useMemo(
    () => [
      { label: "Signed IPA URL", valid: isIpaUrl(fields.ipaUrl) },
      { label: "Public PNG/JPG icon URL", valid: isImageUrl(fields.iconUrl) },
      { label: "Bundle identifier", valid: /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(fields.bundleIdentifier.trim()) },
      { label: "Bundle version", valid: Boolean(fields.bundleVersion.trim()) },
      { label: "App name", valid: Boolean(fields.appName.trim()) },
      { label: "Manifest filename", valid: Boolean(normalizedManifestName(fields.manifestName)) },
    ],
    [fields],
  );

  const allValid = checks.every((check) => check.valid);
  const manifest = useMemo(() => buildManifest(fields), [fields]);
  const manifestFilename = `${normalizedManifestName(fields.manifestName)}.plist`;
  const installUrl = publishedManifest?.installUrl ?? "";

  const update = (key: keyof ManifestFields, value: string) => {
    setPublishedManifest(null);
    setFields((current) => ({ ...current, [key]: value }));
  };

  const loadSample = () => {
    setFields(sample);
    setIconPreview(null);
    setIconFileName("");
    setPublishedManifest(null);
    toast.success("Reference example loaded", { description: "These values came from the supplied sample. Replace them with your own before downloading." });
  };

  const downloadManifest = () => {
    if (!allValid) {
      toast.error("Complete the required manifest fields first.");
      return;
    }
    const blob = new Blob([manifest], { type: "application/x-plist" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = manifestFilename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
    toast.success(`${manifestFilename} downloaded`, { description: "You can keep a local copy. Use Publish & create install link for automatic HTTPS hosting." });
  };

  const publishManifest = () => {
    if (!allValid) {
      toast.error("Complete the required manifest fields first.");
      return;
    }
    publishMutation.mutate({
      ipaUrl: fields.ipaUrl,
      iconUrl: fields.iconUrl,
      bundleIdentifier: fields.bundleIdentifier,
      bundleVersion: fields.bundleVersion,
      appName: fields.appName,
      manifestName: normalizedManifestName(fields.manifestName),
    });
  };

  const copy = async (kind: "manifest" | "install", value: string) => {
    if (!value) {
      toast.error(kind === "install" ? "Publish the manifest first." : "Nothing is available to copy yet.");
      return;
    }
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1700);
    toast.success(kind === "install" ? "iOS installation link copied" : "Manifest XML copied");
  };

  const encodeFileAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });

  const handleIconFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/image\/(png|jpeg)/.test(file.type)) {
      toast.error("Choose a PNG or JPG icon file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Choose an icon smaller than 3 MB.");
      return;
    }
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconPreview(URL.createObjectURL(file));
    setIconFileName(file.name);
    try {
      const contentBase64 = await encodeFileAsBase64(file);
      uploadIconMutation.mutate({ contentBase64, mimeType: file.type as "image/png" | "image/jpeg" });
    } catch (error) {
      toast.error("The icon could not be prepared", { description: error instanceof Error ? error.message : "Try another PNG or JPG file." });
    }
  };

  const handleIconDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingIcon(false);
    void handleIconFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="min-h-screen page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Plist Maker home">
          <img src={hostedAsset("/manus-storage/plist-maker-logo_ffd9f3ec.png")} alt="" className="brand-mark" />
          <span className="brand-name"><em>Plist</em><span>Maker</span><small>OTA</small></span>
        </a>
        <div className="topbar-note"><ShieldCheck size={15} /> Publish a unique HTTPS manifest when ready.</div>
      </header>

      <main id="top" className="workspace">
        <aside className="left-rail" aria-label="Workflow steps">
          <div className="rail-eyebrow">OTA manifest studio</div>
          <h1>Shape the manifest.<br /><i>Keep the chain intact.</i></h1>
          <p className="rail-intro">Build the file iOS reads to locate your signed IPA, app icon, and metadata. When ready, this workshop publishes the HTTPS manifest for you.</p>

          <div className="steps">
            <div className="step step-active"><span>01</span><div><strong>App source</strong><small>IPA &amp; icon address</small></div></div>
            <div className="step"><span>02</span><div><strong>Identity</strong><small>Bundle &amp; display metadata</small></div></div>
            <div className="step"><span>03</span><div><strong>Handoff</strong><small>Manifest &amp; install link</small></div></div>
          </div>

          <div className="rail-footnote">
            <span className="red-thread-dot" />
            <p>Use the exact bundle identifier and version embedded in the signed IPA.</p>
          </div>
        </aside>

        <section className="main-canvas">
          <div className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow">Manifest Workshop <span>•</span> v1.0</p>
              <h2>A blank manifest, ready for your <em>own install details.</em></h2>
              <p>Start with the empty template, add your hosted app details, and publish an install-ready XML artifact in one step.</p>
            </div>
            <img src={hostedAsset("/manus-storage/plist-maker-hero_265ccbbe.jpg")} alt="Abstract manifest document, cobalt tab, and deployment materials on a paper desk" className="hero-image" />
            <div className="hero-annotation"><span>FIELD NOTE 04</span><b>SIGNED IPA →<br />HTTPS MANIFEST</b></div>
          </div>

          <div className="content-grid">
            <form className="form-stack" onSubmit={(event) => { event.preventDefault(); publishManifest(); }}>
              <section className="form-section">
                <div className="section-heading"><span className="step-chip">01</span><div><p>App source</p><h3>Where iOS will retrieve the files</h3></div></div>
                <div className="field-group">
                  <label htmlFor="ipa-url">Signed IPA URL <b>required</b></label>
                  <div className="input-wrap"><PackageCheck size={17} /><input id="ipa-url" type="url" value={fields.ipaUrl} onChange={(event) => update("ipaUrl", event.target.value)} placeholder="https://cdn.example.com/MyApp.ipa" /></div>
                  <p className={isIpaUrl(fields.ipaUrl) ? "field-note valid" : "field-note"}>{isIpaUrl(fields.ipaUrl) ? "HTTPS IPA address recognized." : "Use a public HTTPS URL ending in .ipa."}</p>
                </div>
                <div className="icon-source-grid">
                  <div className="field-group">
                    <label htmlFor="icon-url">Public icon URL <b>required</b></label>
                    <div className="input-wrap"><Link2 size={17} /><input id="icon-url" type="url" value={fields.iconUrl} onChange={(event) => update("iconUrl", event.target.value)} placeholder="https://cdn.example.com/icon.png" /></div>
                    <p className={isImageUrl(fields.iconUrl) ? "field-note valid" : "field-note"}>{isImageUrl(fields.iconUrl) ? "PNG/JPG address recognized." : "Use a public HTTPS PNG or JPG."}</p>
                  </div>
                  <label className={`icon-dropzone ${isDraggingIcon ? "dragging" : ""} ${uploadIconMutation.isPending ? "uploading" : ""}`} htmlFor="icon-file" onDragEnter={(event) => { event.preventDefault(); setIsDraggingIcon(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDraggingIcon(false)} onDrop={handleIconDrop} aria-busy={uploadIconMutation.isPending}>
                    {uploadIconMutation.isPending ? <LoaderCircle size={24} className="icon-upload-spinner" /> : iconPreview ? <img src={iconPreview} alt="Selected app icon preview" /> : <UploadCloud size={24} />}
                    <span>{uploadIconMutation.isPending ? "Uploading icon…" : iconPreview ? iconFileName : "Drop PNG / JPG here"}</span>
                    <small>{uploadIconMutation.isPending ? "Hosting securely" : iconPreview ? "Hosted and added" : "or click to browse"}</small>
                    <input id="icon-file" type="file" accept="image/png,image/jpeg" disabled={uploadIconMutation.isPending} onChange={(event) => void handleIconFile(event.target.files?.[0])} />
                  </label>
                </div>
                <div className="callout"><Info size={16} /><span>Drag in a PNG or JPG up to 3 MB. It will be securely hosted and its public HTTPS URL will be added to the manifest automatically.</span></div>
              </section>

              <section className="form-section">
                <div className="section-heading"><span className="step-chip">02</span><div><p>Identity</p><h3>Describe the signed application</h3></div></div>
                <div className="two-fields">
                  <div className="field-group"><label htmlFor="bundle-id">Bundle identifier <b>required</b></label><input id="bundle-id" value={fields.bundleIdentifier} onChange={(event) => update("bundleIdentifier", event.target.value)} placeholder="com.example.myapp" /></div>
                  <div className="field-group"><label htmlFor="bundle-version">Bundle version <b>required</b></label><input id="bundle-version" value={fields.bundleVersion} onChange={(event) => update("bundleVersion", event.target.value)} placeholder="1.0.0" /></div>
                </div>
                <div className="field-group"><label htmlFor="app-name">App name <b>required</b></label><input id="app-name" value={fields.appName} onChange={(event) => update("appName", event.target.value)} placeholder="My App" /></div>
              </section>

              <section className="form-section handoff-section">
                <div className="section-heading"><span className="step-chip">03</span><div><p>Handoff</p><h3>Publish and install</h3></div></div>
                <div className="two-fields filename-fields">
                  <div className="field-group"><label htmlFor="manifest-name">Manifest filename <b>required</b></label><div className="input-suffix"><input id="manifest-name" value={fields.manifestName} onChange={(event) => update("manifestName", event.target.value)} placeholder="my-app" /><span>.plist</span></div></div>
                <button type="button" className="sample-button" onClick={loadSample}><Sparkles size={16} /> View reference</button>
                </div>
                <button className="download-button" type="submit" disabled={publishMutation.isPending}><Link2 size={18} /> {publishMutation.isPending ? "Publishing manifest…" : "Publish & create install link"}<ArrowUpRight size={17} /></button>
                <button className="download-copy-button" type="button" onClick={downloadManifest}><Download size={16} /> Also download {manifestFilename}</button>
                <div className="install-link-box">
                  <div className="install-label"><span>iOS installation link</span>{publishedManifest ? <b><Check size={13} /> Ready</b> : <b className="pending">Publish to create</b>}</div>
                  <code>{installUrl || "Your install-ready link appears here after publishing."}</code>
                  <div className="install-actions"><button type="button" disabled={!installUrl} onClick={() => copy("install", installUrl)}>{copied === "install" ? <Check size={16} /> : <Clipboard size={16} />}{copied === "install" ? "Copied" : "Copy install link"}</button>{installUrl ? <a href={installUrl}><ChevronRight size={16} /> Open on iOS</a> : <button type="button" disabled><ChevronRight size={16} /> Open on iOS</button>}</div>
                </div>
                {publishedManifest ? <div className="install-guide"><div className="guide-heading"><Check size={15} /> Your manifest is hosted</div><p>On the Apple device you want to install on:</p><ol><li>Tap <strong>Copy install link</strong>.</li><li>Open <strong>Safari</strong>, paste the link into the address bar, and tap Go.</li><li>When iOS prompts you, tap <strong>Install</strong>.</li></ol></div> : <div className="auto-host-note"><Info size={15} /> No manual manifest URL is needed. Publishing creates a unique public HTTPS address automatically.</div>}
              </section>
            </form>

            <aside className="output-panel" aria-live="polite">
              <div className="output-topline"><div><span className={allValid ? "status-dot ready" : "status-dot"} /> {allValid ? "Manifest ready" : "Empty template"}</div><span className="artifact-label">Build artifact</span><button type="button" onClick={() => copy("manifest", manifest)} aria-label="Copy manifest XML">{copied === "manifest" ? <Check size={15} /> : <Clipboard size={15} />}</button></div>
              <div className="paper-preview">
                <div className="paper-fold" />
                <div className="paper-heading"><FileCode2 size={17} /><span>{manifestFilename}</span><small>XML / PLIST</small></div>
                <div className="code-block">{manifest.split("\n").map((line, index) => <CodeLine key={`${line}-${index}`} line={line} number={index + 1} />)}</div>
              </div>
              <div className="output-checks"><div className="checks-title"><span>Preflight</span><b>{checks.filter((check) => check.valid).length}/{checks.length}</b></div>{checks.map((check) => <div className="check-row" key={check.label}><span className={check.valid ? "check-mark good" : "check-mark"}>{check.valid ? <Check size={13} /> : ""}</span>{check.label}</div>)}</div>
              <div className="output-tip"><Info size={16} /><p><strong>How to fill this:</strong> enter each hosted URL and the metadata from your signed IPA. The blank strings in this preview are replaced as you type.</p></div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
