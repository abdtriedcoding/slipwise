"use client";

import { COHERE_LINK } from "@/lib/constant";

export default function Footer() {
  return (
    <footer className="app-footer">
      <a href={COHERE_LINK} target="_blank" rel="noreferrer">
        Powered by Cohere
      </a>
    </footer>
  );
}
