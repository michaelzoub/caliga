export function imageTitleFromFilename(filename: string) {
  const stem = filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return stem || "Article image";
}

export function withImageAttachmentTitles(html: string) {
  if (typeof document === "undefined") return html;

  const root = document.createElement("div");
  root.innerHTML = html;

  root.querySelectorAll("img").forEach((img, index) => {
    const existingTitle = img.getAttribute("title")?.trim();
    const existingAlt = img.getAttribute("alt")?.trim();
    const fallbackTitle = `Article image ${index + 1}`;
    const title = existingTitle || existingAlt || fallbackTitle;

    img.setAttribute("title", title);
    img.setAttribute("alt", existingAlt || title);
  });

  return root.innerHTML;
}
