// src/icons/chevrons.ts
var chevronDownIcon = `
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-chevron-down-icon lucide-chevron-down">
        <path d="m6 9 6 6 6-6"/>
    </svg>`;
var chevronUpIcon = `
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-chevron-up-icon lucide-chevron-up">
        <path d="m18 15-6-6-6 6"/>
    </svg>`;

// src/icons/loader.ts
var loaderIcon = `
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-loader-icon lucide-loader">

        <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
        <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
        <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
        <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
    </svg>`;

// src/icons/refresh.ts
var refreshIcon = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16" />
    </svg>
    `;

// src/services/cache.ts
async function getCachedLinks(url) {
  const result = await chrome.storage.local.get(url);
  return result[url];
}
async function setCachedLinks(url, linkTags, expireTiem) {
  const linkElems = linkTags.map((tag) => tag.outerHTML);
  await chrome.storage.local.set({ [url]: {
    linkHTMLs: linkElems,
    expires: Date.now() + 1e3 * 60 * 60 * expireTiem
  } });
}
async function cleanExpiredCache() {
  const items = await chrome.storage.local.get(null);
  const expiredKeys = [];
  for (const [key, value] of Object.entries(items)) {
    const entry = value;
    if (entry && typeof entry === "object" && typeof entry.expires === "number" && entry.expires <= Date.now()) {
      expiredKeys.push(key);
    }
  }
  if (expiredKeys.length > 0) {
    await chrome.storage.local.remove(expiredKeys);
  }
}

// src/parsers/parseDownloadLinks.ts
function parseDownloadLinks(doc) {
  const downloadLinks = doc.querySelectorAll("#pickDownload a");
  return Array.from(downloadLinks).map(
    (link) => link.cloneNode(true)
  );
}

// src/services/fetchDownloadLinks.ts
async function fetchDownloadlinks(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return parseDownloadLinks(doc);
}

// src/services/rateLimiter.ts
var TokenBucketLimiter = class {
  tokens;
  lastRefill = Date.now();
  capacity;
  refillRate;
  constructor(capacity, refillRate) {
    this.tokens = capacity;
    this.capacity = capacity;
    this.refillRate = refillRate;
  }
  allow() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1e3;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
};
var fetchRateLimiter = new TokenBucketLimiter(3, 0.33333);

// src/icons/check.ts
var checkIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-check-icon lucide-check">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
`;

// src/icons/cancel.ts
var cancelIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-x-icon lucide-x">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
    </svg>
`;

// src/components/progressRing.ts
function progressRing(color = "#3b82f6") {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 15;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  const track = document.createElementNS(svgNS, "circle");
  track.setAttribute("cx", "50");
  track.setAttribute("cy", "50");
  track.setAttribute("r", String(radius));
  track.setAttribute("fill", "none");
  track.setAttribute("stroke", "hsla(220, 13%, 91%, 0.2)");
  track.setAttribute("stroke-width", String(strokeWidth));
  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", "50");
  ring.setAttribute("cy", "50");
  ring.setAttribute("r", String(radius));
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", color);
  ring.setAttribute("stroke-width", String(strokeWidth));
  ring.setAttribute("stroke-dasharray", String(circumference));
  ring.setAttribute("stroke-dashoffset", String(circumference));
  ring.setAttribute("stroke-linecap", "round");
  ring.setAttribute("transform", "rotate(-90 50 50)");
  ring.style.transition = "stroke-dashoffset 0.3s ease";
  svg.appendChild(track);
  svg.appendChild(ring);
  function setProgress(percent) {
    const offset = circumference - percent / 100 * circumference;
    ring.setAttribute("stroke-dashoffset", String(offset));
  }
  return { svg, setProgress };
}

// src/components/progressContainer.ts
function progressContainer(downloadId) {
  const container = document.createElement("span");
  container.classList.add("progress-container");
  const { svg, setProgress } = progressRing();
  container.appendChild(svg);
  function onMessage(message) {
    if (message.type !== "DOWNLOAD_PROGRESS" && message.payload.downloadId !== downloadId) return;
    const { percent, downloadState, error } = message.payload;
    setProgress(percent);
    if (downloadState === "complete") {
      container.innerHTML = checkIcon;
      chrome.runtime.onMessage.removeListener(onMessage);
    }
    if (downloadState === "interrupted") {
      container.innerHTML = cancelIcon;
      chrome.runtime.onMessage.removeListener(onMessage);
    }
  }
  chrome.runtime.onMessage.addListener(onMessage);
  return container;
}

// src/content/animepahe/downloadHandler.ts
var downloadElements = /* @__PURE__ */ new Map();
function downloadLinkElementListener(element) {
  const downloadKey = crypto.randomUUID();
  element.dataset.downloadKey = downloadKey;
  downloadElements.set(downloadKey, element);
  const listener = (e) => {
    e.preventDefault();
    element?.querySelector(".progress-container")?.remove();
    chrome.runtime.sendMessage({
      type: "LAUNCH_TAB",
      url: element.href,
      downloadKey
    });
  };
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "DOWNLOAD_ID_FOUND" || message.downloadKey !== downloadKey) return;
    const element2 = downloadElements.get(message.downloadKey);
    if (!element2) {
      console.warn(
        "Download element not found:",
        message.downloadKey
      );
      return;
    }
    element2.querySelector(".progress-container")?.remove();
    element2.append(progressContainer(message.downloadID));
  });
  element.addEventListener("click", listener);
}
function modifyDropupDownloadLinks() {
  const dropdownNodes = document.querySelectorAll("#pickDownload a");
  if (!dropdownNodes) return [];
  const elems = Array.from(dropdownNodes);
  elems.map((elem) => {
    downloadLinkElementListener(elem);
  });
  return elems;
}

// src/components/downloadLinks.ts
function downloadLink(linkTag) {
  linkTag.className = "download-link";
  downloadLinkElementListener(linkTag);
  return linkTag;
}

// src/components/fetchDownloadButton.ts
function fetchDownloadOptionButtons(url) {
  let open = false;
  let loaded = false;
  const timeHr = 1.5;
  const button = document.createElement("button");
  button.classList.add("download-button");
  const dropdown = document.createElement("div");
  dropdown.classList.add("download-dropdown");
  button.innerHTML = `<span>View Downloads ${chevronDownIcon}</span>`;
  let loadingPromise = null;
  async function load() {
    if (loaded) return true;
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      try {
        const entry = await getCachedLinks(url);
        if (entry) {
          if (entry.expires > Date.now()) {
            const linkTags2 = entry.linkHTMLs.map((html) => {
              const div = document.createElement("div");
              div.innerHTML = html;
              return div.firstElementChild;
            });
            dropdown.append(...linkTags2.map((tag) => downloadLink(tag)));
            loaded = true;
            return true;
          }
        }
        button.innerHTML = `<span>Loading ${loaderIcon}</span>`;
        if (!fetchRateLimiter.allow()) {
          button.innerHTML = `<span>Please wait a moment ${refreshIcon}</span>`;
          return false;
        }
        const linkTags = await fetchDownloadlinks(url);
        await setCachedLinks(url, linkTags, timeHr);
        dropdown.append(...linkTags.map((linkTag) => downloadLink(linkTag)));
        loaded = true;
        return true;
      } catch (err) {
        console.error("Failed to fetch page: ", err);
        button.innerHTML = `<span>Retry ${refreshIcon}</span>`;
        return false;
      } finally {
        loadingPromise = null;
      }
    })();
    return loadingPromise;
  }
  async function toggle() {
    if (!loaded) {
      const success = await load();
      if (!success) {
        return;
      }
    }
    open = !open;
    dropdown.classList.toggle("open", open);
    button.innerHTML = open ? `<span>Hide Downloads ${chevronUpIcon}</span>` : `<span>View Downloads ${chevronDownIcon}</span>`;
  }
  button.addEventListener("click", toggle);
  return [button, dropdown];
}

// src/content/animepahe/injectButton.ts
function injectButtons(episodeSelector) {
  const episodeList = document.querySelector(episodeSelector);
  if (!episodeList) return;
  const episodes = Array.from(episodeList.children);
  episodes.forEach((episode) => {
    if (episode.querySelector(".download-button")) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "episode-download-actions";
    const linkElement = episode.querySelector(".episode .episode-snapshot a");
    if (!linkElement) {
      console.warn("Episode link cannot be found");
      return;
    }
    const url = linkElement.href;
    wrapper.append(...fetchDownloadOptionButtons(url));
    episode.appendChild(wrapper);
  });
}

// src/observers/episodeListObserver.ts
function observeEpisodeList(episodeSelector) {
  const observer = new MutationObserver(() => {
    injectButtons(episodeSelector);
  });
  const wrapper = document.querySelector(".episode-list-wrapper");
  if (!wrapper) {
    return;
  }
  observer.observe(wrapper, {
    childList: true,
    subtree: true
  });
}

// src/content/animepahe/animepahe.ts
async function init() {
  await cleanExpiredCache();
  const episodeSelector = ".episode-list.row";
  injectButtons(episodeSelector);
  observeEpisodeList(episodeSelector);
  modifyDropupDownloadLinks();
}
init();
