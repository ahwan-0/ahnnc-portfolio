import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
// import { ScrollSmoother } from "gsap-trial/ScrollSmoother"; // trial plugin removed
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

// smoother exported as null stub so initialFX import doesn't break
export const smoother = null;

const Navbar = () => {
  useEffect(() => {
    // ScrollSmoother.create removed — using native smooth scroll instead
    document.body.style.overflowY = "auto";

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let el = e.currentTarget as HTMLAnchorElement;
          let section = el.getAttribute("data-href");
          if (section) {
            const target = document.querySelector(section);
            target?.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });
  }, []);

  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          Portfolio
        </a>
        <a
          href="mailto:example@mail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          ahwanhr@zohomail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>
      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
