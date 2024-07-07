import { AuthenticationContext } from "@/common/contexts";
import { parseErrorResponse } from "@/common/utils";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import Dropdown from "../Dropdown";
import { signOut } from "@/lib/actions";
import { RiAccountCircleFill } from "@remixicon/react";

interface AccountDropdownProps {
  onNavClick?: () => void;
}

function AccountDropdown(props: AccountDropdownProps) {
  const { onNavClick } = props;

  const [loading, setLoading] = useState(false);

  const { status, user, update } = useContext(AuthenticationContext);

  if (status === "loading" || loading) {
    return (
      <div
        className="spinner-border spinner-border-sm text-light-gray mx-auto"
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (status !== "success") {
    return null;
  }

  return (
    <Dropdown
      toggle={<span className="">Hi, {user?.name ?? "User"}</span>}
      className="nav-item ms-2"
      toggleClassName="dropdown-toggle nav-link hstack"
      menuClassName="dropdown-menu-end"
    >
      <li>
        <Link
          href="/profile"
          className="dropdown-item text-decoration-none"
          onClick={(e) => onNavClick?.()}
        >
          My profile
        </Link>
      </li>
      <li>
        <Link
          href="/profile/favorites"
          className="dropdown-item text-decoration-none"
          onClick={(e) => onNavClick?.()}
        >
          My favorites
        </Link>
      </li>
      <li>
        <Link
          href="/profile/orders"
          className="dropdown-item text-decoration-none"
          onClick={(e) => onNavClick?.()}
        >
          My orders
        </Link>
      </li>
      <li>
        <Link
          href="/profile/shops"
          className="dropdown-item text-decoration-none"
          onClick={(e) => onNavClick?.()}
        >
          My shops
        </Link>
      </li>
      {user?.role?.match("ADMIN|OWNER") && (
        <>
          <div className="dropdown-divider"></div>
          <li>
            <Link
              href={"/admin"}
              target="_blank"
              className="dropdown-item text-decoration-none"
              onClick={(e) => onNavClick?.()}
            >
              Admin portal
            </Link>
          </li>
        </>
      )}
      <div className="dropdown-divider"></div>
      <li className="dropdown-item">
        <div
          role="button"
          onClick={async () => {
            try {
              onNavClick?.();
              setLoading(true);
              await signOut();
              localStorage.removeItem("access_token");
              update("unauthorized");
            } catch (error) {
              toast.error(parseErrorResponse(error));
            } finally {
              setLoading(false);
            }
          }}
        >
          Logout
        </div>
      </li>
    </Dropdown>
  );
}

export default AccountDropdown;
