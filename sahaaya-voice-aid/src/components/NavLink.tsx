import { NavLink as RouterNavLink, NavLinkProps, useNavigate } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  requireAuth?: boolean;   // if true, redirects to /login when no session
  hideWhenAuth?: boolean;  // if true, hides link when user IS logged in
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      requireAuth = false,
      hideWhenAuth = false,
      to,
      onClick,
      ...props
    },
    ref,
  ) => {
    const navigate   = useNavigate();
    const isLoggedIn = !!localStorage.getItem("sahaaya_user");

    // Hide this link entirely when the condition is met
    if (hideWhenAuth && isLoggedIn)  return null;
    if (requireAuth  && !isLoggedIn) return null;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If auth is required and user is not logged in, intercept and redirect
        if (requireAuth && !isLoggedIn) {
          e.preventDefault();
          navigate("/login");
          return;
        }
        onClick?.(e);
      },
      [requireAuth, isLoggedIn, navigate, onClick],
    );

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onClick={handleClick}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };