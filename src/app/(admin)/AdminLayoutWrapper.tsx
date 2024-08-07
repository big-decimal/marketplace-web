"use client";
import { withAuthentication } from "@/common/WithAuthentication";
import { AuthenticationContext } from "@/common/contexts";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import SideMenu from "./SideMenu";

const minSideMenuWidth = 80;
const maxSideMenuWidth = 250;

function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [delayExpanded, setDelayExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { user } = useContext(AuthenticationContext);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width } = window;

      setMenuExpanded(width >= 992);
    };

    const { innerWidth: width } = window;
    setMenuExpanded(width >= 992);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const expanded = menuExpanded;
    const timer = setTimeout(
      () => {
        setDelayExpanded(expanded);
      },
      menuExpanded ? 10 : minSideMenuWidth
    );

    return () => {
      clearTimeout(timer);
    };
  }, [menuExpanded]);

  useEffect(() => {
    if (user && !user.role?.match("ADMIN|OWNER")) {
      router.push("/");
    }
  }, [user, router]);

  if (user?.role !== "ADMIN" && user?.role !== "OWNER") {
    return <></>;
  }

  return (
    <div className="d-flex h-100">
      <LazyMotion features={domAnimation} strict>
        <m.div
          className="bg-secondary"
          initial={{
            width: maxSideMenuWidth
          }}
          animate={{
            width: menuExpanded ? maxSideMenuWidth : minSideMenuWidth
          }}
          transition={{
            ease: "easeIn",
            width: { duration: 0.1 }
          }}
          style={{
            minWidth: menuExpanded ? maxSideMenuWidth : minSideMenuWidth,
            width: menuExpanded ? maxSideMenuWidth : minSideMenuWidth
          }}
        >
          <SideMenu expanded={delayExpanded} />
        </m.div>
      </LazyMotion>

      <div
        ref={contentRef}
        className="flex-grow-1"
        style={{ overflow: "hidden" }}
      >
        <div className="d-flex flex-column h-100">
          <div className="flex-shrink-0">
            <Header
              onBarClick={() => {
                setMenuExpanded(!menuExpanded);
              }}
            />
          </div>

          <div
            className="container-fluid flex-grow-1 py-3"
            style={{
              overflowY: "auto"
            }}
          >
            {children}
          </div>

          <div className="flex-shrink-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthentication(AdminLayoutWrapper);
