import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SplitType = "chars" | "words" | "lines";

export class SplitText {
  el: HTMLElement | HTMLElement[];
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  private _originals: { el: HTMLElement; html: string }[] = [];

  constructor(
    el: HTMLElement | HTMLElement[] | string | string[],
    options: { type: string; linesClass?: string }
  ) {
    // Resolve selector strings to elements
    if (typeof el === "string") {
      this.el = Array.from(document.querySelectorAll(el)) as HTMLElement[];
    } else if (Array.isArray(el)) {
      this.el = (el as string[]).flatMap((e) =>
        typeof e === "string"
          ? (Array.from(document.querySelectorAll(e)) as HTMLElement[])
          : [e as HTMLElement]
      );
    } else {
      this.el = el;
    }

    const els = Array.isArray(this.el) ? this.el : [this.el];
    const types = options.type.split(",").map((t) => t.trim()) as SplitType[];

    els.forEach((element) => {
      this._originals.push({ el: element, html: element.innerHTML });
      this._split(element, types, options.linesClass);
    });
  }

  private _split(el: HTMLElement, types: SplitType[], linesClass?: string) {
    const text = el.innerText;
    const wantChars = types.includes("chars");
    const wantWords = types.includes("words");
    const wantLines = types.includes("lines");

    const wordSpans = text.split(" ").map((word) => {
      const wordEl = document.createElement("span");
      wordEl.style.display = "inline-block";
      wordEl.style.whiteSpace = "nowrap";
      if (wantChars) {
        word.split("").forEach((char) => {
          const charEl = document.createElement("span");
          charEl.style.display = "inline-block";
          charEl.textContent = char;
          wordEl.appendChild(charEl);
          this.chars.push(charEl);
        });
      } else {
        wordEl.textContent = word;
      }
      if (wantWords) this.words.push(wordEl);
      return wordEl;
    });

    el.innerHTML = "";
    wordSpans.forEach((span, i) => {
      el.appendChild(span);
      if (i < wordSpans.length - 1) {
        const space = document.createElement("span");
        space.innerHTML = " ";
        space.style.display = "inline-block";
        el.appendChild(space);
      }
    });

    if (wantLines) {
      const lineMap = new Map<number, HTMLElement[]>();
      wordSpans.forEach((span) => {
        const top = span.offsetTop;
        if (!lineMap.has(top)) lineMap.set(top, []);
        lineMap.get(top)!.push(span);
      });
      lineMap.forEach((spans) => {
        const lineEl = document.createElement("div");
        lineEl.style.display = "block";
        lineEl.style.overflow = "hidden";
        if (linesClass) lineEl.classList.add(linesClass);
        spans[0].parentElement?.insertBefore(lineEl, spans[0]);
        spans.forEach((s) => lineEl.appendChild(s));
        this.lines.push(lineEl);
      });
    }
  }

  revert() {
    this._originals.forEach(({ el, html }) => {
      el.innerHTML = html;
    });
    this.chars = [];
    this.words = [];
    this.lines = [];
  }
}

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return;

  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");
  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
    }
    para.split = new SplitText(para, { type: "lines,words", linesClass: "split-line" });
    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.02,
      }
    );
  });

  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new SplitText(title, { type: "chars,lines", linesClass: "split-line" });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.03,
      }
    );
  });

  ScrollTrigger.addEventListener("refresh", () => setSplitText());
}
