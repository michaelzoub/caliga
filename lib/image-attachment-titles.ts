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

    const next = img.nextElementSibling;
    const hasCaption =
      next instanceof HTMLParagraphElement &&
      (next.getAttribute("data-image-caption") === "true" ||
        next.textContent?.trim() === title);

    if (!hasCaption) {
      const caption = document.createElement("p");
      caption.setAttribute("data-image-caption", "true");
      caption.textContent = title;
      img.insertAdjacentElement("afterend", caption);
    } else if (next instanceof HTMLParagraphElement) {
      next.setAttribute("data-image-caption", "true");
    }
  });

  return root.innerHTML;
}
