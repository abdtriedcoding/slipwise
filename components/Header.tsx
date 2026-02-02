"use client";

import { GITHUB_LINK } from "@/lib/constant";

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="wordmark">Slip<span>wise</span></span>
        <a href={GITHUB_LINK} target="_blank" rel="noreferrer" className="topbar-link">
          Star on GitHub
        </a>
      </div>
    </header>
  );
}
