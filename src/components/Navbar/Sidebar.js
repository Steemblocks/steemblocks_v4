import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiFillHome,
  AiOutlineOrderedList,
  AiFillThunderbolt,
} from "react-icons/ai";
import { FaPowerOff } from "react-icons/fa";
import { RiCommunityFill } from "react-icons/ri";
import { GrHistory } from "react-icons/gr";
import { BiSolidUserAccount } from "react-icons/bi";
import { LuSignalHigh } from "react-icons/lu";
import { FcAbout } from "react-icons/fc";
import { FaCogs } from "react-icons/fa";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className={styles.sidebar}>
      <div className={`${styles.sidebarContainer} ${styles.expanded}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.navigation}>
            <ul className={styles.navList}>
              <li>
                <Link
                  to="/"
                  className={`${styles.navLink} ${
                    activeLink === "/" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/")}
                >
                  <AiFillHome className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Home
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/power-holders"
                  className={`${styles.navLink} ${
                    activeLink === "/power-holders" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/power-holders")}
                >
                  <AiFillThunderbolt className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Power Holders
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/power-down-lists"
                  className={`${styles.navLink} ${
                    activeLink === "/power-down-lists" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/power-down-lists")}
                >
                  <FaPowerOff className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Power Downs
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/new-account"
                  className={`${styles.navLink} ${
                    activeLink === "/new-account" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/new-account")}
                >
                  <BiSolidUserAccount className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    New Accounts
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/account-ranking"
                  className={`${styles.navLink} ${
                    activeLink === "/account-ranking" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/account-ranking")}
                >
                  <LuSignalHigh className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Account Ranking
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/witness-list"
                  className={`${styles.navLink} ${
                    activeLink === "/witness-list" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/witness-list")}
                >
                  <AiOutlineOrderedList className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Witness List
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/witness-monitor"
                  className={`${styles.navLink} ${
                    activeLink === "/witness-monitor" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/witness-monitor")}
                >
                  <FaCogs className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Witness Monitor
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/community-data"
                  className={`${styles.navLink} ${
                    activeLink === "/community-data" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/community-data")}
                >
                  <RiCommunityFill className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Community Data
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/content-history"
                  className={`${styles.navLink} ${
                    activeLink === "/content-history" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/content-history")}
                >
                  <GrHistory className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    Content History
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className={`${styles.navLink} ${
                    activeLink === "/about" ? styles.active : ""
                  }`}
                  onClick={() => handleLinkClick("/about")}
                >
                  <FcAbout className={styles.navIcon} />
                  <span className={`${styles.navText} ${styles.visible}`}>
                    About
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
